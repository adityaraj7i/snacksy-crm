-- AlterTable: automations
ALTER TABLE "automations" RENAME COLUMN "isActive" TO "status_old";
ALTER TABLE "automations" ADD COLUMN "description" TEXT;
ALTER TABLE "automations" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "automations" ADD COLUMN "delayMinutes" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "automations" ADD COLUMN "maxTriggersPerCustomer" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "automations" ADD COLUMN "executionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "automations" ADD COLUMN "lastTriggeredAt" TIMESTAMP(3);
ALTER TABLE "automations" ADD COLUMN "createdById" TEXT;
ALTER TABLE "automations" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "automations" DROP COLUMN "status_old";

-- DropTable: automation_runs
DROP TABLE IF EXISTS "automation_runs";

-- CreateTable: automation_actions
CREATE TABLE "automation_actions" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "channel" TEXT,
    "subject" TEXT,
    "content" TEXT,
    "pointsToIssue" INTEGER NOT NULL DEFAULT 0,
    "tagId" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: automation_executions
CREATE TABLE "automation_executions" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "automations_organizationId_status_idx" ON "automations"("organizationId", "status");
CREATE INDEX "automation_executions_automationId_customerId_idx" ON "automation_executions"("automationId", "customerId");

-- AddForeignKey
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
