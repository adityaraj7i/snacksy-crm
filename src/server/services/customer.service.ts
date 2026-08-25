import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { normalizePhoneNumber } from "@/lib/phone";
import { normalizeEmail } from "@/lib/email";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  lifecycleStage?: string;
  status?: string;
  tagId?: string;
  segmentId?: string;
  sortBy?: "createdAt" | "visitCount" | "totalSpendNpr" | "lastVisitAt";
  sortOrder?: "asc" | "desc";
}

export async function getCustomers(params: GetCustomersParams = {}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.read");

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize || 15));
  const skip = (page - 1) * pageSize;

  const where: any = {
    organizationId: currentUser.organizationId,
    status: params.status || { in: ["ACTIVE", "INACTIVE"] },
  };

  if (params.lifecycleStage) {
    where.lifecycleStage = params.lifecycleStage;
  }

  if (params.tagId) {
    where.customerTags = {
      some: { tagId: params.tagId },
    };
  }

  if (params.segmentId) {
    where.segmentMembers = {
      some: { segmentId: params.segmentId },
    };
  }

  if (params.search) {
    const q = params.search.trim();
    const normalizedQ = normalizePhoneNumber(q) || q;

    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { normalizedPhone: { contains: normalizedQ } },
      { email: { contains: q, mode: "insensitive" } },
      { id: { equals: q } },
    ];
  }

  const orderByField = params.sortBy || "createdAt";
  const orderDirection = params.sortOrder || "desc";

  const [total, customers] = await Promise.all([
    db.customer.count({ where }),
    db.customer.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [orderByField]: orderDirection },
      include: {
        customerTags: { include: { tag: true } },
        preferences: true,
      },
    }),
  ]);

  return {
    data: customers.map((c) => ({
      id: c.id,
      name: c.displayName || `${c.firstName} ${c.lastName || ""}`.trim(),
      phone: c.phone,
      email: c.email,
      status: c.status,
      lifecycleStage: c.lifecycleStage,
      visitCount: c.visitCount,
      totalSpendNpr: c.totalSpendNpr,
      averageSpendNpr: c.averageSpendNpr,
      lastVisitAt: c.lastVisitAt,
      createdAt: c.createdAt,
      tags: c.customerTags.map((ct) => ({ id: ct.tag.id, name: ct.tag.name, colorHex: ct.tag.colorHex })),
    })),
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function findLikelyDuplicates(phone: string, email?: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const normPhone = normalizePhoneNumber(phone);
  const normEmail = normalizeEmail(email);

  const OR: any[] = [];
  if (normPhone) OR.push({ normalizedPhone: normPhone });
  if (normEmail) OR.push({ normalizedEmail: normEmail });

  if (OR.length === 0) return [];

  return db.customer.findMany({
    where: {
      organizationId: currentUser.organizationId,
      status: "ACTIVE",
      OR,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      createdAt: true,
    },
    take: 5,
  });
}

export async function createCustomer(data: {
  firstName: string;
  lastName?: string;
  phone: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  city?: string;
  address?: string;
  preferredBranchId?: string;
  acquisitionSource?: string;
  favoriteFood?: string;
  favoriteDrink?: string;
  allergies?: string[];
  dietaryPreferences?: string[];
  spicePreference?: string;
  seatingPreference?: string;
  consentSms?: boolean;
  consentEmail?: boolean;
  consentWhatsApp?: boolean;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.create");

  const normPhone = normalizePhoneNumber(data.phone);
  const normEmail = normalizeEmail(data.email);

  if (!normPhone) {
    throw new Error("A valid Nepal phone number is required.");
  }

  const displayName = `${data.firstName} ${data.lastName || ""}`.trim();

  const customer = await db.customer.create({
    data: {
      organizationId: currentUser.organizationId,
      preferredBranchId: data.preferredBranchId,
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim(),
      displayName,
      phone: data.phone.trim(),
      normalizedPhone: normPhone,
      email: data.email?.trim(),
      normalizedEmail: normEmail,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      city: data.city || "Kathmandu",
      address: data.address,
      acquisitionSource: data.acquisitionSource || "WALK_IN",
      createdById: currentUser.id,
      status: "ACTIVE",
      lifecycleStage: "NEW",
      preferences: {
        create: {
          favoriteFood: data.favoriteFood,
          favoriteDrink: data.favoriteDrink,
          allergies: JSON.stringify(data.allergies || []),
          dietaryPreferences: JSON.stringify(data.dietaryPreferences || []),
          spicePreference: data.spicePreference,
          seatingPreference: data.seatingPreference,
          marketingOptInSms: data.consentSms ?? true,
          marketingOptInEmail: data.consentEmail ?? true,
        },
      },
      consentEvents: {
        createMany: {
          data: [
            { channel: "SMS", granted: data.consentSms ?? true, source: "FORM", actorId: currentUser.id },
            { channel: "EMAIL", granted: data.consentEmail ?? true, source: "FORM", actorId: currentUser.id },
            { channel: "WHATSAPP", granted: data.consentWhatsApp ?? true, source: "FORM", actorId: currentUser.id },
          ],
        },
      },
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "customer.create",
      resource: "Customer",
      resourceId: customer.id,
      details: JSON.stringify({ name: displayName, phone: normPhone }),
    },
  });

  logger.info("Customer profile created", { customerId: customer.id, actorId: currentUser.id });
  revalidatePath("/customers");
  return customer;
}

export async function getCustomer360(customerId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.read");

  const customer = await db.customer.findFirst({
    where: { id: customerId, organizationId: currentUser.organizationId },
    include: {
      preferences: true,
      notes: { include: { author: true }, orderBy: [{ pinned: "desc" }, { createdAt: "desc" }] },
      customerTags: { include: { tag: true } },
      consentEvents: { orderBy: { createdAt: "desc" } },
      reservations: { orderBy: { reservationDateTime: "desc" }, take: 20 },
    },
  });

  if (!customer) throw new Error("Customer not found");

  return customer;
}

export async function addCustomerNote(customerId: string, content: string, category = "GENERAL", pinned = false) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.read");

  const note = await db.customerNote.create({
    data: {
      customerId,
      authorId: currentUser.id,
      category,
      content,
      pinned,
    },
  });

  revalidatePath(`/customers/${customerId}`);
  return note;
}

export async function recordConsentEvent(customerId: string, channel: "SMS" | "EMAIL" | "WHATSAPP", granted: boolean, source = "POS") {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.update");

  const consent = await db.consentEvent.create({
    data: {
      customerId,
      channel,
      granted,
      source,
      actorId: currentUser.id,
    },
  });

  // Update preferences state
  if (channel === "SMS") {
    await db.customerPreference.update({ where: { customerId }, data: { marketingOptInSms: granted } });
  } else if (channel === "EMAIL") {
    await db.customerPreference.update({ where: { customerId }, data: { marketingOptInEmail: granted } });
  }

  revalidatePath(`/customers/${customerId}`);
  return consent;
}

export async function mergeCustomers(primaryId: string, duplicateId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.merge");

  if (primaryId === duplicateId) throw new Error("Cannot merge a customer into itself.");

  const [primary, duplicate] = await Promise.all([
    db.customer.findFirst({ where: { id: primaryId, organizationId: currentUser.organizationId } }),
    db.customer.findFirst({ where: { id: duplicateId, organizationId: currentUser.organizationId } }),
  ]);

  if (!primary || !duplicate) throw new Error("Primary or duplicate customer record not found.");

  // Execute Merge inside a database transaction
  await db.$transaction([
    // 1. Move notes to primary customer
    db.customerNote.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } }),
    // 2. Move consent events to primary customer
    db.consentEvent.updateMany({ where: { customerId: duplicateId }, data: { customerId: primaryId } }),
    // 3. Update primary customer combined totals
    db.customer.update({
      where: { id: primaryId },
      data: {
        visitCount: primary.visitCount + duplicate.visitCount,
        totalSpendNpr: primary.totalSpendNpr + duplicate.totalSpendNpr,
        averageSpendNpr: Math.round(
          (primary.totalSpendNpr + duplicate.totalSpendNpr) / Math.max(1, primary.visitCount + duplicate.visitCount)
        ),
      },
    }),
    // 5. Mark duplicate customer as MERGED
    db.customer.update({
      where: { id: duplicateId },
      data: {
        status: "MERGED",
        mergedIntoId: primaryId,
      },
    }),
    // 6. Audit record
    db.auditLog.create({
      data: {
        organizationId: currentUser.organizationId,
        userId: currentUser.id,
        action: "customer.merge",
        resource: "Customer",
        resourceId: primaryId,
        details: JSON.stringify({ primaryId, duplicateId }),
      },
    }),
  ]);

  logger.info("Customer merge completed", { primaryId, duplicateId, actorId: currentUser.id });
  revalidatePath("/customers");
  return { success: true };
}

export async function exportCustomersCsv() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "customer.export");

  const customers = await db.customer.findMany({
    where: { organizationId: currentUser.organizationId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  const sanitizeCsvValue = (val: any) => {
    if (val === null || val === undefined) return "";
    let str = String(val).replace(/"/g, '""');
    // Escape formula injection characters (=, +, -, @)
    if (/^[=+\-@]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str}"`;
  };

  const headers = ["ID", "First Name", "Last Name", "Phone", "Email", "City", "Stage", "Total Visits", "Lifetime Spend (NPR)", "Created At"];
  const rows = customers.map((c) => [
    sanitizeCsvValue(c.id),
    sanitizeCsvValue(c.firstName),
    sanitizeCsvValue(c.lastName),
    sanitizeCsvValue(c.phone),
    sanitizeCsvValue(c.email),
    sanitizeCsvValue(c.city),
    sanitizeCsvValue(c.lifecycleStage),
    sanitizeCsvValue(c.visitCount),
    sanitizeCsvValue((c.totalSpendNpr / 100).toFixed(2)),
    sanitizeCsvValue(c.createdAt.toISOString()),
  ]);

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "customer.export",
      resource: "Customer",
      details: JSON.stringify({ count: customers.length }),
    },
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
