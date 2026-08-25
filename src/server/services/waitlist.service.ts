import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission, requireBranchAccess } from "@/server/policies";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export async function getWaitlistQueue(branchId?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.read");

  const where: any = {
    organizationId: currentUser.organizationId,
    status: { in: ["WAITING", "NOTIFIED"] },
  };

  if (branchId) {
    requireBranchAccess(currentUser, branchId);
    where.branchId = branchId;
  }

  const entries = await db.waitlistEntry.findMany({
    where,
    orderBy: { arrivalTime: "asc" },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      branch: { select: { id: true, name: true } },
    },
  });

  return entries.map((e) => ({
    id: e.id,
    customerName: `${e.customer.firstName} ${e.customer.lastName || ""}`.trim(),
    customerId: e.customerId,
    customerPhone: e.customer.phone,
    branchName: e.branch.name,
    partySize: e.partySize,
    arrivalTime: e.arrivalTime,
    estimatedWaitMinutes: e.estimatedWaitMinutes,
    preferredSeating: e.preferredSeating,
    status: e.status,
    notes: e.notes,
  }));
}

export async function addWaitlistEntry(data: {
  branchId: string;
  customerId: string;
  partySize: number;
  estimatedWaitMinutes?: number;
  preferredSeating?: string;
  notes?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.create");
  requireBranchAccess(currentUser, data.branchId);

  const entry = await db.waitlistEntry.create({
    data: {
      organizationId: currentUser.organizationId,
      branchId: data.branchId,
      customerId: data.customerId,
      partySize: data.partySize,
      estimatedWaitMinutes: data.estimatedWaitMinutes || 15,
      preferredSeating: data.preferredSeating,
      notes: data.notes,
      status: "WAITING",
    },
  });

  revalidatePath("/waitlist");
  return entry;
}

export async function updateWaitlistStatus(entryId: string, targetStatus: "NOTIFIED" | "SEATED" | "CANCELLED" | "LEFT") {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.update");

  const entry = await db.waitlistEntry.update({
    where: { id: entryId },
    data: {
      status: targetStatus,
      ...(targetStatus === "SEATED" ? { seatedAt: new Date() } : {}),
    },
  });

  logger.info("Waitlist entry status updated", { entryId, targetStatus });
  revalidatePath("/waitlist");
  return { success: true, message: targetStatus === "NOTIFIED" ? "Notification marked. (Note: SMS Gateway configuration required for automated SMS)." : "Status updated." };
}
