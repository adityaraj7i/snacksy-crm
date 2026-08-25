-- AlterTable: customers
ALTER TABLE "customers" ADD COLUMN "noShowCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: restaurant_tables
ALTER TABLE "restaurant_tables" ADD COLUMN "name" TEXT;
ALTER TABLE "restaurant_tables" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "restaurant_tables" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "restaurant_tables" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: reservations
ALTER TABLE "reservations" RENAME COLUMN "reservationTime" TO "reservationDateTime";
ALTER TABLE "reservations" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "reservations" ADD COLUMN "expectedDurationMinutes" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "reservations" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'PHONE';
ALTER TABLE "reservations" ADD COLUMN "occasion" TEXT;
ALTER TABLE "reservations" ADD COLUMN "customerNotes" TEXT;
ALTER TABLE "reservations" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "reservations" ADD COLUMN "createdById" TEXT;
ALTER TABLE "reservations" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: waitlist_entries
ALTER TABLE "waitlist_entries" RENAME COLUMN "quotedWaitMin" TO "estimatedWaitMinutes";
ALTER TABLE "waitlist_entries" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "waitlist_entries" ADD COLUMN "arrivalTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "waitlist_entries" ADD COLUMN "preferredSeating" TEXT;
ALTER TABLE "waitlist_entries" ADD COLUMN "notes" TEXT;
ALTER TABLE "waitlist_entries" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "restaurant_tables_organizationId_branchId_idx" ON "restaurant_tables"("organizationId", "branchId");
CREATE INDEX "reservations_organizationId_branchId_idx" ON "reservations"("organizationId", "branchId");
CREATE INDEX "reservations_customerId_status_idx" ON "reservations"("customerId", "status");
CREATE INDEX "reservations_tableId_reservationDateTime_idx" ON "reservations"("tableId", "reservationDateTime");
CREATE INDEX "waitlist_entries_organizationId_branchId_idx" ON "waitlist_entries"("organizationId", "branchId");
CREATE INDEX "waitlist_entries_customerId_status_idx" ON "waitlist_entries"("customerId", "status");
