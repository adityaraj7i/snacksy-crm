-- CreateTable: menu_categories
CREATE TABLE "menu_categories" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable: menu_items
CREATE TABLE "menu_items" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT NOT NULL,
    "priceNpr" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- AlterTable: visits
ALTER TABLE "visits" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "visits" ADD COLUMN "visitDateTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "visits" ADD COLUMN "visitType" TEXT NOT NULL DEFAULT 'DINE_IN';
ALTER TABLE "visits" ADD COLUMN "reservationId" TEXT;
ALTER TABLE "visits" ADD COLUMN "orderId" TEXT;
ALTER TABLE "visits" ADD COLUMN "amountSpentNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "visits" ADD COLUMN "staffUserId" TEXT;
ALTER TABLE "visits" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'POS';
ALTER TABLE "visits" ADD COLUMN "notes" TEXT;
ALTER TABLE "visits" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "visits" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: orders
ALTER TABLE "orders" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "orders" ADD COLUMN "externalOrderId" TEXT;
ALTER TABLE "orders" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'POS';
ALTER TABLE "orders" ADD COLUMN "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "orders" ADD COLUMN "serviceChargeNpr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE "orders" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable: order_items
ALTER TABLE "order_items" ADD COLUMN "menuItemId" TEXT;
ALTER TABLE "order_items" ADD COLUMN "externalItemId" TEXT;
ALTER TABLE "order_items" ADD COLUMN "categoryName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "menu_categories_organizationId_name_key" ON "menu_categories"("organizationId", "name");
CREATE UNIQUE INDEX "menu_items_organizationId_name_key" ON "menu_items"("organizationId", "name");
CREATE UNIQUE INDEX "orders_organizationId_externalOrderId_key" ON "orders"("organizationId", "externalOrderId");

CREATE INDEX "visits_organizationId_branchId_idx" ON "visits"("organizationId", "branchId");
CREATE INDEX "visits_customerId_status_idx" ON "visits"("customerId", "status");
CREATE INDEX "orders_organizationId_branchId_idx" ON "orders"("organizationId", "branchId");
CREATE INDEX "orders_customerId_paymentStatus_idx" ON "orders"("customerId", "paymentStatus");
