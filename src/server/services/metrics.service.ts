import { db } from "@/server/db/client";
import { logger } from "@/server/lib/logger";

export async function recalculateCustomerMetrics(customerId: string) {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    select: { visitCount: true, totalSpendNpr: true },
  });

  if (!customer) return;

  const visitCount = customer.visitCount || 0;
  const totalSpendNpr = customer.totalSpendNpr || 0;
  const averageSpendNpr = Math.round(totalSpendNpr / Math.max(1, visitCount));

  let lifecycleStage = "NEW";
  if (totalSpendNpr >= 2500000 || visitCount >= 15) {
    lifecycleStage = "VIP";
  } else if (visitCount >= 4) {
    lifecycleStage = "REGULAR";
  } else if (visitCount >= 2) {
    lifecycleStage = "RETURNING";
  }

  await db.customer.update({
    where: { id: customerId },
    data: { averageSpendNpr, lifecycleStage },
  });

  logger.info("Customer metrics recalculated", { customerId, visitCount, totalSpendNpr, lifecycleStage });
  return { visitCount, totalSpendNpr, averageSpendNpr, lifecycleStage };
}

export async function getCustomerFavoriteInsights(customerId: string) {
  return { topItems: [], topCategories: [] };
}
