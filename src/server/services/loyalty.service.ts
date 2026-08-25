import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { logger } from "@/server/lib/logger";
import { generateRandomToken } from "@/server/auth/passwords";
import { revalidatePath } from "next/cache";

export async function getOrCreateLoyaltyAccount(customerId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  let account = await db.loyaltyAccount.findUnique({
    where: { customerId },
    include: { currentTier: true },
  });

  if (!account) {
    // Find initial tier (lowest sequence / Member)
    const initialTier = await db.loyaltyTier.findFirst({
      where: { organizationId: currentUser.organizationId },
      orderBy: { sequence: "asc" },
    });

    account = await db.loyaltyAccount.create({
      data: {
        organizationId: currentUser.organizationId,
        customerId,
        currentTierId: initialTier?.id,
        currentPoints: 0,
        lifetimePointsEarned: 0,
        lifetimePointsRedeemed: 0,
        status: "ACTIVE",
      },
      include: { currentTier: true },
    });
  }

  return account;
}



export async function redeemReward(customerId: string, rewardId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "loyalty.manage");

  const [account, reward] = await Promise.all([
    db.loyaltyAccount.findUnique({ where: { customerId } }),
    db.reward.findFirst({ where: { id: rewardId, organizationId: currentUser.organizationId, active: true } }),
  ]);

  if (!account || account.status !== "ACTIVE") {
    throw new Error("Customer loyalty account is not active or enrolled.");
  }

  if (!reward) throw new Error("Reward not found or is currently inactive.");

  if (account.currentPoints < reward.pointsRequired) {
    throw new Error(`Insufficient points balance. Customer has ${account.currentPoints} pts, but reward requires ${reward.pointsRequired} pts.`);
  }

  const voucherCode = `RW-${generateRandomToken(4).toUpperCase()}`;

  // Atomic Database Transaction for Redemption
  const result = await db.$transaction(async (tx) => {
    // 1. Deduct Points & Record Lifetime Redemption
    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentPoints: { decrement: reward.pointsRequired },
        lifetimePointsRedeemed: { increment: reward.pointsRequired },
      },
    });

    // 2. Write Immutable Ledger Entry
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: "REDEEMED",
        points: -reward.pointsRequired,
        source: "PROMOTION",
        sourceReferenceId: reward.id,
        description: `Redeemed reward: ${reward.name} (Voucher ${voucherCode})`,
        createdById: currentUser.id,
      },
    });

    // 3. Create Voucher Redemption Record
    const redemption = await tx.rewardRedemption.create({
      data: {
        organizationId: currentUser.organizationId,
        accountId: account.id,
        rewardId: reward.id,
        transactionId: transaction.id,
        code: voucherCode,
        pointsSpent: reward.pointsRequired,
        status: "ISSUED",
        expiresAt: new Date(Date.now() + reward.validityDays * 24 * 60 * 60 * 1000),
      },
    });

    return { redemption, updatedPoints: updatedAccount.currentPoints, voucherCode };
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "loyalty.redeem",
      resource: "RewardRedemption",
      resourceId: result.redemption.id,
      details: JSON.stringify({ customerId, rewardName: reward.name, code: voucherCode }),
    },
  });

  logger.info("Reward redeemed successfully", { customerId, rewardName: reward.name, voucherCode });
  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/loyalty");
  return result;
}

export async function adjustLoyaltyPoints(customerId: string, pointsDelta: number, reason: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "loyalty.adjust");

  if (!reason || !reason.trim()) {
    throw new Error("A valid reason must be provided for manual points adjustments.");
  }

  const account = await getOrCreateLoyaltyAccount(customerId);

  if (pointsDelta < 0 && account.currentPoints + pointsDelta < 0) {
    throw new Error("Cannot adjust points below zero balance.");
  }

  const result = await db.$transaction(async (tx) => {
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: pointsDelta >= 0 ? "MANUAL_ADJUSTMENT" : "REVERSED",
        points: pointsDelta,
        source: "MANUAL",
        description: `Manual adjustment (${pointsDelta >= 0 ? "+" : ""}${pointsDelta} pts): ${reason.trim()}`,
        createdById: currentUser.id,
      },
    });

    const updatedAccount = await tx.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        currentPoints: { increment: pointsDelta },
        ...(pointsDelta > 0 ? { lifetimePointsEarned: { increment: pointsDelta } } : {}),
      },
    });

    await recalculateLoyaltyTierInternal(account.id, tx);
    return { transaction, currentPoints: updatedAccount.currentPoints };
  });

  await db.auditLog.create({
    data: {
      organizationId: currentUser.organizationId,
      userId: currentUser.id,
      action: "loyalty.manual_adjust",
      resource: "LoyaltyAccount",
      resourceId: account.id,
      details: JSON.stringify({ pointsDelta, reason }),
    },
  });

  revalidatePath(`/customers/${customerId}`);
  revalidatePath("/loyalty");
  return result;
}

async function recalculateLoyaltyTierInternal(accountId: string, tx: any) {
  const account = await tx.loyaltyAccount.findUnique({
    where: { id: accountId },
    include: { customer: true },
  });

  if (!account || !account.customer) return;

  const tiers = await tx.loyaltyTier.findMany({
    where: { organizationId: account.organizationId },
    orderBy: { sequence: "desc" }, // Highest tier first
  });

  for (const tier of tiers) {
    const spendMatch = account.customer.totalSpendNpr >= tier.minSpendNpr;
    const visitsMatch = account.customer.visitCount >= tier.minVisits;
    const pointsMatch = account.lifetimePointsEarned >= tier.minPoints;

    if (spendMatch || visitsMatch || pointsMatch) {
      if (account.currentTierId !== tier.id) {
        await tx.loyaltyAccount.update({
          where: { id: accountId },
          data: { currentTierId: tier.id },
        });
      }
      break;
    }
  }
}

export async function getLoyaltyDashboardMetrics() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "loyalty.read");

  const [accounts, transactions, redemptions, tiers] = await Promise.all([
    db.loyaltyAccount.findMany({ where: { organizationId: currentUser.organizationId }, include: { currentTier: true } }),
    db.loyaltyTransaction.findMany({ where: { account: { organizationId: currentUser.organizationId } } }),
    db.rewardRedemption.findMany({ where: { organizationId: currentUser.organizationId } }),
    db.loyaltyTier.findMany({ where: { organizationId: currentUser.organizationId }, orderBy: { sequence: "asc" } }),
  ]);

  const totalMembers = accounts.length;
  const totalPointsIssued = transactions.filter((t) => t.points > 0).reduce((sum, t) => sum + t.points, 0);
  const totalPointsRedeemed = Math.abs(transactions.filter((t) => t.type === "REDEEMED").reduce((sum, t) => sum + t.points, 0));
  const outstandingPoints = accounts.reduce((sum, a) => sum + a.currentPoints, 0);

  const tierDistributionMap = new Map<string, number>();
  accounts.forEach((a) => {
    const tierName = a.currentTier?.name || "Member";
    tierDistributionMap.set(tierName, (tierDistributionMap.get(tierName) || 0) + 1);
  });

  return {
    totalMembers,
    totalPointsIssued,
    totalPointsRedeemed,
    outstandingPoints,
    redemptionCount: redemptions.length,
    tierDistribution: tiers.map((t) => ({ name: t.name, colorHex: t.colorHex, count: tierDistributionMap.get(t.name) || 0 })),
  };
}
