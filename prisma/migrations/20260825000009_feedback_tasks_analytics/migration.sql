-- AlterTable: feedback
ALTER TABLE "feedback" ADD COLUMN "organizationId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "feedback" ADD COLUMN "visitId" TEXT;
ALTER TABLE "feedback" ADD COLUMN "orderId" TEXT;
ALTER TABLE "feedback" ADD COLUMN "resolutionNotes" TEXT;
ALTER TABLE "feedback" ADD COLUMN "resolvedById" TEXT;
ALTER TABLE "feedback" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: tasks
ALTER TABLE "tasks" ADD COLUMN "branchId" TEXT;
ALTER TABLE "tasks" ADD COLUMN "feedbackId" TEXT;
ALTER TABLE "tasks" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'MEDIUM';
ALTER TABLE "tasks" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'GENERAL';
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'TODO';
ALTER TABLE "tasks" ALTER COLUMN "createdById" DROP NOT NULL;
ALTER TABLE "tasks" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "feedback"("id") ON DELETE SET NULL ON UPDATE CASCADE;
