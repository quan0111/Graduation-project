/*
  Warnings:

  - You are about to drop the column `createAt` on the `Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEED_MORE_INFO');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('HOME_TOP', 'HOME_MIDDLE', 'HOME_BOTTOM', 'CATEGORY_PAGE', 'SHOP_PAGE');

-- CreateEnum
CREATE TYPE "BannerStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BannerAction" AS ENUM ('VIEW', 'CLICK');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'EARNED', 'SETTLED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'RECEIVED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CancelledBy" AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CancelStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductStatus" ADD VALUE 'REJECT';
ALTER TYPE "ProductStatus" ADD VALUE 'APROVAL';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "createAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "ProductAttribute" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Shipment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerPayout" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerApplication" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shopName" TEXT NOT NULL,
    "shopSlug" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "businessPhone" TEXT,
    "businessEmail" TEXT,
    "taxCode" TEXT,
    "addressLine" TEXT,
    "ward" TEXT,
    "district" TEXT,
    "province" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "redirectUrl" TEXT,
    "buttonText" TEXT,
    "position" "BannerPosition" NOT NULL,
    "status" "BannerStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerTracking" (
    "id" SERIAL NOT NULL,
    "bannerId" INTEGER NOT NULL,
    "userId" INTEGER,
    "sessionId" TEXT,
    "action" "BannerAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BannerTracking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformCommission" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "orderItemId" INTEGER,
    "shopId" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "grossAmount" DOUBLE PRECISION NOT NULL,
    "commissionAmount" DOUBLE PRECISION NOT NULL,
    "sellerNetAmount" DOUBLE PRECISION NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopCommissionConfig" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopCommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryCommissionConfig" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryCommissionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnRequest" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "rejectReason" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "reviewedById" INTEGER,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnItem" (
    "id" SERIAL NOT NULL,
    "returnRequestId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refundAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReturnItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReturnEvidence" (
    "id" SERIAL NOT NULL,
    "returnRequestId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderCancellation" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "cancelledBy" "CancelledBy" NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "status" "CancelStatus" NOT NULL DEFAULT 'CANCELLED',
    "refundAmount" DOUBLE PRECISION,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "SellerPayout_shopId_idx" ON "SellerPayout"("shopId");

-- CreateIndex
CREATE INDEX "SellerPayout_status_idx" ON "SellerPayout"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SellerApplication_shopSlug_key" ON "SellerApplication"("shopSlug");

-- CreateIndex
CREATE INDEX "SellerApplication_userId_idx" ON "SellerApplication"("userId");

-- CreateIndex
CREATE INDEX "SellerApplication_status_idx" ON "SellerApplication"("status");

-- CreateIndex
CREATE INDEX "Banner_position_status_idx" ON "Banner"("position", "status");

-- CreateIndex
CREATE INDEX "Banner_startAt_endAt_idx" ON "Banner"("startAt", "endAt");

-- CreateIndex
CREATE INDEX "BannerTracking_bannerId_action_idx" ON "BannerTracking"("bannerId", "action");

-- CreateIndex
CREATE INDEX "BannerTracking_userId_idx" ON "BannerTracking"("userId");

-- CreateIndex
CREATE INDEX "PlatformCommission_orderId_idx" ON "PlatformCommission"("orderId");

-- CreateIndex
CREATE INDEX "PlatformCommission_orderItemId_idx" ON "PlatformCommission"("orderItemId");

-- CreateIndex
CREATE INDEX "PlatformCommission_shopId_idx" ON "PlatformCommission"("shopId");

-- CreateIndex
CREATE INDEX "PlatformCommission_status_idx" ON "PlatformCommission"("status");

-- CreateIndex
CREATE INDEX "PlatformCommission_createdAt_idx" ON "PlatformCommission"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ShopCommissionConfig_shopId_key" ON "ShopCommissionConfig"("shopId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryCommissionConfig_categoryId_key" ON "CategoryCommissionConfig"("categoryId");

-- CreateIndex
CREATE INDEX "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");

-- CreateIndex
CREATE INDEX "ReturnRequest_userId_idx" ON "ReturnRequest"("userId");

-- CreateIndex
CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");

-- CreateIndex
CREATE INDEX "ReturnItem_returnRequestId_idx" ON "ReturnItem"("returnRequestId");

-- CreateIndex
CREATE INDEX "ReturnItem_orderItemId_idx" ON "ReturnItem"("orderItemId");

-- CreateIndex
CREATE INDEX "ReturnEvidence_returnRequestId_idx" ON "ReturnEvidence"("returnRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderCancellation_orderId_key" ON "OrderCancellation"("orderId");

-- CreateIndex
CREATE INDEX "OrderCancellation_orderId_idx" ON "OrderCancellation"("orderId");

-- CreateIndex
CREATE INDEX "OrderCancellation_cancelledBy_idx" ON "OrderCancellation"("cancelledBy");

-- CreateIndex
CREATE INDEX "OrderCancellation_cancelledAt_idx" ON "OrderCancellation"("cancelledAt" DESC);

-- CreateIndex
CREATE INDEX "Order_shopId_idx" ON "Order"("shopId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_ownerId_key" ON "Shop"("ownerId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayout" ADD CONSTRAINT "SellerPayout_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerApplication" ADD CONSTRAINT "SellerApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerApplication" ADD CONSTRAINT "SellerApplication_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerTracking" ADD CONSTRAINT "BannerTracking_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannerTracking" ADD CONSTRAINT "BannerTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformCommission" ADD CONSTRAINT "PlatformCommission_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformCommission" ADD CONSTRAINT "PlatformCommission_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformCommission" ADD CONSTRAINT "PlatformCommission_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopCommissionConfig" ADD CONSTRAINT "ShopCommissionConfig_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryCommissionConfig" ADD CONSTRAINT "CategoryCommissionConfig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnItem" ADD CONSTRAINT "ReturnItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReturnEvidence" ADD CONSTRAINT "ReturnEvidence_returnRequestId_fkey" FOREIGN KEY ("returnRequestId") REFERENCES "ReturnRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCancellation" ADD CONSTRAINT "OrderCancellation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
