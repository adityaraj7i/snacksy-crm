-- AlterTable: segments
ALTER TABLE "segments" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'DYNAMIC';
ALTER TABLE "segments" ADD COLUMN "isSystemSegment" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "segments" ADD COLUMN "ruleOperator" TEXT NOT NULL DEFAULT 'AND';
ALTER TABLE "segments" ADD COLUMN "memberCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "segments" ADD COLUMN "lastCalculatedAt" TIMESTAMP(3);
ALTER TABLE "segments" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "segments" ADD COLUMN "createdById" TEXT;

-- AlterTable: segment_rules
ALTER TABLE "segment_rules" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: segment_members
CREATE TABLE "segment_members" (
    "segmentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segment_members_pkey" PRIMARY KEY ("segmentId","customerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "segments_organizationId_name_key" ON "segments"("organizationId", "name");

-- AddForeignKey
ALTER TABLE "segment_members" ADD CONSTRAINT "segment_members_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "segment_members" ADD CONSTRAINT "segment_members_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
