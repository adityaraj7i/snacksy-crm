-- AlterTable: customers
ALTER TABLE "customers" ADD COLUMN "preferredBranchId" TEXT;
ALTER TABLE "customers" ADD COLUMN "displayName" TEXT;
ALTER TABLE "customers" ADD COLUMN "normalizedPhone" TEXT;
ALTER TABLE "customers" ADD COLUMN "alternatePhone" TEXT;
ALTER TABLE "customers" ADD COLUMN "normalizedEmail" TEXT;
ALTER TABLE "customers" ADD COLUMN "preferredLanguage" TEXT DEFAULT 'en';
ALTER TABLE "customers" ADD COLUMN "city" TEXT DEFAULT 'Kathmandu';
ALTER TABLE "customers" ADD COLUMN "address" TEXT;
ALTER TABLE "customers" ADD COLUMN "whatsAppNumber" TEXT;
ALTER TABLE "customers" ADD COLUMN "acquisitionSource" TEXT DEFAULT 'WALK_IN';
ALTER TABLE "customers" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "customers" ADD COLUMN "firstVisitAt" TIMESTAMP(3);
ALTER TABLE "customers" ADD COLUMN "visitCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN "averageSpendNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "customers" ADD COLUMN "createdById" TEXT;

-- AlterTable: customer_preferences
ALTER TABLE "customer_preferences" ADD COLUMN "favoriteFood" TEXT;
ALTER TABLE "customer_preferences" ADD COLUMN "favoriteDrink" TEXT;
ALTER TABLE "customer_preferences" ADD COLUMN "dietaryPreferences" TEXT[];
ALTER TABLE "customer_preferences" ADD COLUMN "allergies" TEXT[];
ALTER TABLE "customer_preferences" ADD COLUMN "spicePreference" TEXT;
ALTER TABLE "customer_preferences" ADD COLUMN "servicePreferences" TEXT;

-- AlterTable: customer_notes
ALTER TABLE "customer_notes" ADD COLUMN "branchId" TEXT;
ALTER TABLE "customer_notes" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "customer_notes" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: tags
ALTER TABLE "tags" ADD COLUMN "description" TEXT;
ALTER TABLE "tags" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: customer_tags
ALTER TABLE "customer_tags" ADD COLUMN "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "customer_tags" ADD COLUMN "assignedById" TEXT;

-- AlterTable: consent_events
ALTER TABLE "consent_events" ADD COLUMN "actorId" TEXT;

-- CreateIndex
CREATE INDEX "customers_organizationId_normalizedPhone_idx" ON "customers"("organizationId", "normalizedPhone");
CREATE INDEX "customers_organizationId_normalizedEmail_idx" ON "customers"("organizationId", "normalizedEmail");
