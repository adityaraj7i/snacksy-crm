-- AlterTable: campaigns
ALTER TABLE "campaigns" ADD COLUMN "branchId" TEXT;
ALTER TABLE "campaigns" ALTER COLUMN "segmentId" DROP NOT NULL;
ALTER TABLE "campaigns" ADD COLUMN "subject" TEXT;
ALTER TABLE "campaigns" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';
ALTER TABLE "campaigns" ADD COLUMN "templateData" TEXT;
ALTER TABLE "campaigns" ADD COLUMN "totalRecipients" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "sentCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "deliveredCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "failedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "openedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "clickedCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "optOutCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "attributionWindowDays" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "campaigns" ADD COLUMN "attributedRevenueNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "campaigns" ADD COLUMN "createdById" TEXT;
ALTER TABLE "campaigns" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: campaign_messages
ALTER TABLE "campaign_messages" RENAME COLUMN "recipient" TO "destination";
ALTER TABLE "campaign_messages" ADD COLUMN "customerId" TEXT;
ALTER TABLE "campaign_messages" ADD COLUMN "providerMessageId" TEXT;
ALTER TABLE "campaign_messages" ADD COLUMN "errorMessage" TEXT;
ALTER TABLE "campaign_messages" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: message_events
ALTER TABLE "message_events" RENAME COLUMN "messageId" TO "campaignMessageId";
ALTER TABLE "message_events" RENAME COLUMN "timestamp" TO "occurredAt";
ALTER TABLE "message_events" ADD COLUMN "rawPayload" TEXT;
ALTER TABLE "message_events" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "campaigns_organizationId_status_idx" ON "campaigns"("organizationId", "status");
CREATE INDEX "campaign_messages_campaignId_status_idx" ON "campaign_messages"("campaignId", "status");
CREATE INDEX "message_events_campaignMessageId_eventType_idx" ON "message_events"("campaignMessageId", "eventType");

-- AddForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT IF EXISTS "campaigns_segmentId_fkey";
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "campaign_messages" ADD CONSTRAINT "campaign_messages_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
