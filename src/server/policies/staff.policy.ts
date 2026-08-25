import { UserContext } from "@/types";
import { requirePermission, requireBranchAccess } from "./index";

export function canReadStaff(user: UserContext): boolean {
  return user.roles.includes("Owner") || user.permissions.includes("staff.read") || user.permissions.includes("staff.manage");
}

export function canManageStaff(user: UserContext): boolean {
  return user.roles.includes("Owner") || user.permissions.includes("staff.manage");
}

export function requireStaffManage(user: UserContext): void {
  requirePermission(user, "staff.manage");
}
