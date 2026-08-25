import { db } from "@/server/db/client";
import { getSessionFromCookies, clearSessionCookie } from "@/server/auth/session";
import { UserContext, Permission, RoleName } from "@/types";
import { UnauthorizedError, ForbiddenError } from "@/server/lib/errors";

/**
 * Validates session against database and checks active status.
 */
export async function getCurrentUser(): Promise<UserContext | null> {
  const session = await getSessionFromCookies();
  if (!session) return null;

  // Real-time Database Check for deactivated users
  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
      userBranches: true,
    },
  });

  if (!user || !user.isActive || user.status !== "ACTIVE") {
    // Invalidate session cookie if user deactivated or status suspended
    await clearSessionCookie();
    return null;
  }

  const roles = user.userRoles.map((ur) => ur.role.name as RoleName);
  const permissionsSet = new Set<Permission>();
  user.userRoles.forEach((ur) => {
    ur.role.rolePermissions.forEach((rp) => {
      permissionsSet.add(rp.permission.code as Permission);
    });
  });

  const branchIds = user.userBranches.map((ub) => ub.branchId);

  return {
    id: user.id,
    email: user.email,
    name: user.fullName,
    organizationId: user.organizationId,
    branchIds,
    roles,
    permissions: Array.from(permissionsSet),
  };
}

export async function requireUser(): Promise<UserContext> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError("Authentication required. Please log in.");
  }
  return user;
}

export async function requireOrganization(): Promise<{ user: UserContext; organizationId: string }> {
  const user = await requireUser();
  return { user, organizationId: user.organizationId };
}

export function hasPermission(user: UserContext, permission: Permission): boolean {
  if (user.roles.includes("Owner")) return true;
  return user.permissions.includes(permission);
}

export function requirePermission(user: UserContext, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new ForbiddenError(`Permission denied. Required capability: ${permission}`);
  }
}

export function hasBranchAccess(user: UserContext, branchId: string): boolean {
  if (user.roles.includes("Owner")) return true;
  return user.branchIds.includes(branchId);
}

export function requireBranchAccess(user: UserContext, branchId: string): void {
  if (!hasBranchAccess(user, branchId)) {
    throw new ForbiddenError("Access to the specified branch is restricted.");
  }
}
