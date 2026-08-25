"use server";

import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { hashPassword } from "@/server/auth/passwords";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export async function getStaffList() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const staff = await db.user.findMany({
    where: { organizationId: currentUser.organizationId },
    include: {
      userRoles: { include: { role: true } },
      userBranches: { include: { branch: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return staff.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    status: u.status,
    isActive: u.isActive,
    lastLoginAt: u.lastLoginAt,
    roles: u.userRoles.map((ur) => ur.role.name),
    branches: u.userBranches.map((ub) => ub.branch.name),
    createdAt: u.createdAt,
  }));
}

export async function createStaffMember(_prevState: unknown, formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized" };

  // Require staff.manage permission
  try {
    requirePermission(currentUser, "staff.manage");
  } catch (err: any) {
    return { error: err.message };
  }

  const fullName = formData.get("fullName")?.toString().trim();
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString();
  const roleName = formData.get("roleName")?.toString() || "Staff";
  const branchId = formData.get("branchId")?.toString();

  if (!fullName || !email || !password || password.length < 8) {
    return { error: "Please provide full name, valid email, and password (min 8 chars)." };
  }

  // Check existing
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email address already exists." };
  }

  const passwordHash = await hashPassword(password);

  const role = await db.role.findFirst({
    where: { organizationId: currentUser.organizationId, name: roleName },
  });

  if (!role) {
    return { error: `Role '${roleName}' not found.` };
  }

  const newStaff = await db.user.create({
    data: {
      organizationId: currentUser.organizationId,
      fullName,
      email,
      passwordHash,
      status: "ACTIVE",
      isActive: true,
      userRoles: {
        create: { roleId: role.id },
      },
      ...(branchId
        ? {
            userBranches: {
              create: { branchId },
            },
          }
        : {}),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "staff.created",
      resource: "User",
      resourceId: newStaff.id,
      details: JSON.stringify({ email: newStaff.email, role: roleName }),
    },
  });

  logger.info("New staff member created", { actorId: currentUser.id, newUserId: newStaff.id });
  revalidatePath("/staff");
  return { success: true, message: "Staff member created successfully!" };
}

export async function toggleStaffStatus(userId: string, targetStatus: "ACTIVE" | "DEACTIVATED") {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { error: "Unauthorized" };

  try {
    requirePermission(currentUser, "staff.manage");
  } catch (err: any) {
    return { error: err.message };
  }

  if (userId === currentUser.id) {
    return { error: "You cannot deactivate your own user account." };
  }

  const isActive = targetStatus === "ACTIVE";

  await db.user.update({
    where: { id: userId, organizationId: currentUser.organizationId },
    data: {
      status: targetStatus,
      isActive,
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: targetStatus === "DEACTIVATED" ? "staff.deactivated" : "staff.reactivated",
      resource: "User",
      resourceId: userId,
    },
  });

  revalidatePath("/staff");
  return { success: true };
}
