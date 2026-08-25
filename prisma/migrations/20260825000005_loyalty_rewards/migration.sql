-- CreateTable: loyalty_settings
CREATE TABLE "loyalty_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "earnRateSpendNpr" INTEGER NOT NULL DEFAULT 10000,
    "minSpendToEarnNpr" INTEGER NOT NULL DEFAULT 10000,
    "earnPointsPerVisit" INTEGER NOT NULL DEFAULT 5,
    "pointsExpirationDays" INTEGER DEFAULT 365,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: loyalty_settings
CREATE UNIQUE INDEX "loyalty_settings_organizationId_key" ON "loyalty_settings"("organizationId");

-- AlterTable: loyalty_accounts
ALTER TABLE "loyalty_accounts" RENAME COLUMN "pointsBalance" TO "currentPoints";
ALTER TABLE "loyalty_accounts" RENAME COLUMN "lifetimePoints" TO "lifetimePointsEarned";
ALTER TABLE "loyalty_accounts" ADD COLUMN "lifetimePointsRedeemed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "loyalty_accounts" ADD COLUMN "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "loyalty_accounts" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable: loyalty_tiers
ALTER TABLE "loyalty_tiers" ADD COLUMN "minSpendNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "loyalty_tiers" ADD COLUMN "minVisits" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "loyalty_tiers" ADD COLUMN "colorHex" TEXT NOT NULL DEFAULT '#6B7280';
ALTER TABLE "loyalty_tiers" ADD COLUMN "benefitsSummary" TEXT;
ALTER TABLE "loyalty_tiers" ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "loyalty_tiers" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: loyalty_transactions
ALTER TABLE "loyalty_transactions" RENAME COLUMN "loyaltyAccountId" TO "accountId";
ALTER TABLE "loyalty_transactions" RENAME COLUMN "referenceId" TO "sourceReferenceId";
ALTER TABLE "loyalty_transactions" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'ORDER';
ALTER TABLE "loyalty_transactions" ADD COLUMN "description" TEXT;
ALTER TABLE "loyalty_transactions" ADD COLUMN "createdById" TEXT;

-- AlterTable: rewards
ALTER TABLE "rewards" RENAME COLUMN "title" TO "name";
ALTER TABLE "rewards" RENAME COLUMN "isActive" TO "active";
ALTER TABLE "rewards" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'FIXED_DISCOUNT_NPR';
ALTER TABLE "rewards" ADD COLUMN "valueNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "rewards" ADD COLUMN "valuePercent" DOUBLE PRECISION;
ALTER TABLE "rewards" ADD COLUMN "validityDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "rewards" ADD COLUMN "redemptionLimit" INTEGER;

-- AlterTable: reward_redemptions
ALTER TABLE "reward_redemptions" RENAME COLUMN "loyaltyAccountId" TO "accountId";
ALTER TABLE "reward_redemptions" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "reward_redemptions" ADD COLUMN "transactionId" TEXT;
ALTER TABLE "reward_redemptions" ADD COLUMN "pointsSpent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reward_redemptions" ADD COLUMN "branchId" TEXT;
ALTER TABLE "reward_redemptions" ADD COLUMN "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "reward_redemptions" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "loyalty_transactions_accountId_createdAt_idx" ON "loyalty_transactions"("accountId", "createdAt");

-- AddForeignKey
ALTER TABLE "loyalty_settings" ADD CONSTRAINT "loyalty_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
