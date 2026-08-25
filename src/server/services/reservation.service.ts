import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission, requireBranchAccess } from "@/server/policies";
import { recalculateCustomerMetrics } from "./metrics.service";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SEATED", "CANCELLED", "NO_SHOW"],
  SEATED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export async function checkTableOverlapConflict(
  tableId: string,
  startDateTime: Date,
  durationMinutes = 90,
  excludeReservationId?: string
): Promise<boolean> {
  const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

  const existingReservations = await db.reservation.findMany({
    where: {
      tableId,
      status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
      ...(excludeReservationId ? { id: { not: excludeReservationId } } : {}),
    },
    select: {
      id: true,
      reservationDateTime: true,
      expectedDurationMinutes: true,
    },
  });

  for (const res of existingReservations) {
    const resStart = res.reservationDateTime;
    const resEnd = new Date(resStart.getTime() + res.expectedDurationMinutes * 60 * 1000);

    // Overlap condition: start < resEnd && end > resStart
    if (startDateTime < resEnd && endDateTime > resStart) {
      return true; // Conflict detected!
    }
  }

  return false; // No conflict
}

export interface GetReservationsParams {
  page?: number;
  pageSize?: number;
  branchId?: string;
  customerId?: string;
  status?: string;
  date?: string; // YYYY-MM-DD
}

export async function getReservations(params: GetReservationsParams = {}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.read");

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 15));
  const skip = (page - 1) * pageSize;

  const where: any = {
    organizationId: currentUser.organizationId,
  };

  if (params.branchId) {
    requireBranchAccess(currentUser, params.branchId);
    where.branchId = params.branchId;
  } else if (!currentUser.roles.includes("Owner") && currentUser.branchIds.length > 0) {
    where.branchId = { in: currentUser.branchIds };
  }

  if (params.customerId) where.customerId = params.customerId;
  if (params.status) where.status = params.status;

  if (params.date) {
    const start = new Date(`${params.date}T00:00:00.000Z`);
    const end = new Date(`${params.date}T23:59:59.999Z`);
    where.reservationDateTime = { gte: start, lte: end };
  }

  const [total, reservations] = await Promise.all([
    db.reservation.count({ where }),
    db.reservation.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { reservationDateTime: "asc" },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            visitCount: true,
            totalSpendNpr: true,
            noShowCount: true,
            preferences: { select: { allergies: true } },
          },
        },
        branch: { select: { id: true, name: true, code: true } },
        table: { select: { id: true, tableNumber: true, section: true } },
      },
    }),
  ]);

  return {
    data: reservations.map((r) => ({
      id: r.id,
      customerName: `${r.customer.firstName} ${r.customer.lastName || ""}`.trim(),
      customerId: r.customerId,
      customerPhone: r.customer.phone,
      customerVisitCount: r.customer.visitCount,
      customerLifetimeSpend: r.customer.totalSpendNpr,
      customerNoShowCount: r.customer.noShowCount,
      customerAllergies: typeof r.customer.preferences?.allergies === "string" ? JSON.parse(r.customer.preferences.allergies || "[]") : r.customer.preferences?.allergies || [],
      branchName: r.branch.name,
      branchId: r.branch.id,
      tableName: r.table ? `${r.table.tableNumber} (${r.table.section || "Main"})` : "Unassigned",
      tableId: r.tableId,
      reservationDateTime: r.reservationDateTime,
      expectedDurationMinutes: r.expectedDurationMinutes,
      partySize: r.partySize,
      source: r.source,
      occasion: r.occasion,
      customerNotes: r.customerNotes,
      internalNotes: r.internalNotes,
      status: r.status,
    })),
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function createReservation(data: {
  branchId: string;
  customerId: string;
  tableId?: string;
  reservationDateTime: string;
  expectedDurationMinutes?: number;
  partySize: number;
  source?: string;
  occasion?: string;
  customerNotes?: string;
  internalNotes?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.create");
  requireBranchAccess(currentUser, data.branchId);

  const startDateTime = new Date(data.reservationDateTime);
  const duration = data.expectedDurationMinutes || 90;

  // Table Overlap Conflict Guard
  if (data.tableId) {
    const hasConflict = await checkTableOverlapConflict(data.tableId, startDateTime, duration);
    if (hasConflict) {
      throw new Error("Table assignment conflict: Table is already reserved during this time slot.");
    }
  }

  const reservation = await db.reservation.create({
    data: {
      organizationId: currentUser.organizationId,
      branchId: data.branchId,
      customerId: data.customerId,
      tableId: data.tableId,
      reservationDateTime: startDateTime,
      expectedDurationMinutes: duration,
      partySize: data.partySize,
      source: data.source || "PHONE",
      occasion: data.occasion,
      customerNotes: data.customerNotes,
      internalNotes: data.internalNotes,
      status: "CONFIRMED",
      createdById: currentUser.id,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "reservation.create",
      resource: "Reservation",
      resourceId: reservation.id,
      details: JSON.stringify({ customerId: data.customerId, partySize: data.partySize }),
    },
  });

  logger.info("Reservation created successfully", { reservationId: reservation.id, customerId: data.customerId });
  revalidatePath("/reservations");
  revalidatePath(`/customers/${data.customerId}`);
  return reservation;
}

export async function updateReservationStatus(reservationId: string, targetStatus: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.update");

  const reservation = await db.reservation.findFirst({
    where: { id: reservationId, organizationId: currentUser.organizationId },
    include: { customer: true },
  });

  if (!reservation) throw new Error("Reservation not found.");

  const currentStatus = reservation.status;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(targetStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${targetStatus}'.`);
  }

  // Execute status update transaction
  await db.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: targetStatus },
    });

    // If marked NO_SHOW -> Increment customer noShowCount
    if (targetStatus === "NO_SHOW") {
      await tx.customer.update({
        where: { id: reservation.customerId },
        data: { noShowCount: { increment: 1 } },
      });
    }

    // If SEATED -> Recalculate customer metrics
    if (targetStatus === "SEATED") {
      await recalculateCustomerMetrics(reservation.customerId);
    }
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: `reservation.${targetStatus.toLowerCase()}`,
      resource: "Reservation",
      resourceId: reservationId,
    },
  });

  logger.info("Reservation status updated", { reservationId, from: currentStatus, to: targetStatus });
  revalidatePath("/reservations");
  revalidatePath(`/customers/${reservation.customerId}`);
  return { success: true };
}

export async function getReservationReportMetrics(branchId?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "report.read");

  const where: any = { organizationId: currentUser.organizationId };
  if (branchId) where.branchId = branchId;

  const reservations = await db.reservation.findMany({
    where,
    select: { status: true, partySize: true, source: true },
  });

  const total = reservations.length;
  const completed = reservations.filter((r) => r.status === "COMPLETED" || r.status === "SEATED").length;
  const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
  const noShow = reservations.filter((r) => r.status === "NO_SHOW").length;

  const totalPartySize = reservations.reduce((sum, r) => sum + r.partySize, 0);
  const avgPartySize = total > 0 ? (totalPartySize / total).toFixed(1) : "0";

  const sourcesMap = new Map<string, number>();
  reservations.forEach((r) => {
    sourcesMap.set(r.source, (sourcesMap.get(r.source) || 0) + 1);
  });

  return {
    total,
    completionRate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : "0%",
    cancellationRate: total > 0 ? `${((cancelled / total) * 100).toFixed(1)}%` : "0%",
    noShowRate: total > 0 ? `${((noShow / total) * 100).toFixed(1)}%` : "0%",
    avgPartySize,
    sources: Array.from(sourcesMap.entries()).map(([source, count]) => ({ source, count })),
  };
}
