import { db } from "@/server/db/client";
import { getCurrentUser } from "@/server/policies";

export async function getQRCodeSettings() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const tables = await db.restaurantTable.findMany({
    where: { organizationId: currentUser.organizationId, active: true },
    orderBy: { tableNumber: "asc" },
  });

  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  const counterQRUrl = `${baseUrl}/menu/public`;

  const tableQRCodes = tables.map((t) => ({
    id: t.id,
    tableNumber: t.tableNumber,
    name: t.name || `Table ${t.tableNumber}`,
    section: t.section || "MAIN_HALL",
    qrUrl: `${baseUrl}/menu/public?table=${encodeURIComponent(t.tableNumber)}`,
  }));

  return {
    counterQRUrl,
    tableQRCodes,
    totalTables: tables.length,
  };
}
