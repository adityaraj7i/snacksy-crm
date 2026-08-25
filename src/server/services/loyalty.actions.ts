"use server";

import { redeemReward, adjustLoyaltyPoints } from "./loyalty.service";
import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { revalidatePath } from "next/cache";

export async function redeemRewardAction(customerId: string, rewardId: string) {
  return redeemReward(customerId, rewardId);
}

export async function adjustLoyaltyPointsAction(customerId: string, pointsDelta: number, reason: string) {
  return adjustLoyaltyPoints(customerId, pointsDelta, reason);
}

export async function updateLoyaltySettingsAction(data: {
  earnRateSpendNpr: number; // Paisa
  minSpendToEarnNpr: number; // Paisa
  earnPointsPerVisit: number;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "settings.manage");

  const settings = await db.loyaltySettings.upsert({
    where: { organizationId: currentUser.organizationId },
    update: {
      earnRateSpendNpr: Math.max(1000, data.earnRateSpendNpr),
      minSpendToEarnNpr: Math.max(0, data.minSpendToEarnNpr),
      earnPointsPerVisit: Math.max(0, data.earnPointsPerVisit),
    },
    create: {
      organizationId: currentUser.organizationId,
      earnRateSpendNpr: Math.max(1000, data.earnRateSpendNpr),
      minSpendToEarnNpr: Math.max(0, data.minSpendToEarnNpr),
      earnPointsPerVisit: Math.max(0, data.earnPointsPerVisit),
    },
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "loyalty_settings.update",
      resource: "LoyaltySettings",
      resourceId: settings.id,
    },
  });

  revalidatePath("/loyalty/settings");
  return settings;
}
