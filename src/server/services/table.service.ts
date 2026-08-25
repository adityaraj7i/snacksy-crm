import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission, requireBranchAccess } from "@/server/policies";

export async function getBranchTables(branchId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "reservation.read");
  requireBranchAccess(currentUser, branchId);

  return db.restaurantTable.findMany({
    where: {
      organizationId: currentUser.organizationId,
      branchId,
      active: true,
    },
    orderBy: [{ section: "asc" }, { tableNumber: "asc" }],
  });
}
