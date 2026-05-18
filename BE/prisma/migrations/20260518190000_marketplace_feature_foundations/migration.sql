DO $$ BEGIN
    CREATE TYPE "ReviewMediaType" AS ENUM ('IMAGE', 'VIDEO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FlashSaleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "usageLimitPerUser" INTEGER;

ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "identityFullName" TEXT;
ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "identityNumber" TEXT;
ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "identityFrontUrl" TEXT;
ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "identityBackUrl" TEXT;
ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "shippingOptions" JSONB;
ALTER TABLE "SellerApplication" ADD COLUMN IF NOT EXISTS "taxInfo" JSONB;

CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_productId_key" ON "Wishlist"("userId", "productId");
CREATE INDEX IF NOT EXISTS "Wishlist_userId_createdAt_idx" ON "Wishlist"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Wishlist_productId_idx" ON "Wishlist"("productId");

ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ReviewMedia" (
    "id" SERIAL PRIMARY KEY,
    "reviewId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "type" "ReviewMediaType" NOT NULL DEFAULT 'IMAGE',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ReviewMedia_reviewId_idx" ON "ReviewMedia"("reviewId");
ALTER TABLE "ReviewMedia" ADD CONSTRAINT "ReviewMedia_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ReviewReply" (
    "id" SERIAL PRIMARY KEY,
    "reviewId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ReviewReply_reviewId_idx" ON "ReviewReply"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewReply_sellerId_idx" ON "ReviewReply"("sellerId");
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_reviewId_fkey"
    FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewReply" ADD CONSTRAINT "ReviewReply_sellerId_fkey"
    FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "CouponRedemption" (
    "id" SERIAL PRIMARY KEY,
    "couponId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "CouponRedemption_couponId_userId_idx" ON "CouponRedemption"("couponId", "userId");
CREATE INDEX IF NOT EXISTS "CouponRedemption_userId_idx" ON "CouponRedemption"("userId");
CREATE INDEX IF NOT EXISTS "CouponRedemption_orderId_idx" ON "CouponRedemption"("orderId");
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "FlashSale" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "FlashSaleStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "FlashSale_status_startsAt_endsAt_idx" ON "FlashSale"("status", "startsAt", "endsAt");

CREATE TABLE IF NOT EXISTS "FlashSaleItem" (
    "id" SERIAL PRIMARY KEY,
    "flashSaleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "shopId" INTEGER NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "stockLimit" INTEGER,
    "soldCount" INTEGER NOT NULL DEFAULT 0,
    "purchaseLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "FlashSaleItem_flashSaleId_productId_variantId_key" ON "FlashSaleItem"("flashSaleId", "productId", "variantId");
CREATE INDEX IF NOT EXISTS "FlashSaleItem_productId_idx" ON "FlashSaleItem"("productId");
CREATE INDEX IF NOT EXISTS "FlashSaleItem_shopId_idx" ON "FlashSaleItem"("shopId");
ALTER TABLE "FlashSaleItem" ADD CONSTRAINT "FlashSaleItem_flashSaleId_fkey"
    FOREIGN KEY ("flashSaleId") REFERENCES "FlashSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashSaleItem" ADD CONSTRAINT "FlashSaleItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashSaleItem" ADD CONSTRAINT "FlashSaleItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FlashSaleItem" ADD CONSTRAINT "FlashSaleItem_shopId_fkey"
    FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "ShipmentEvent" (
    "id" SERIAL PRIMARY KEY,
    "shipmentId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "location" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ShipmentEvent_shipmentId_occurredAt_idx" ON "ShipmentEvent"("shipmentId", "occurredAt" DESC);
CREATE INDEX IF NOT EXISTS "ShipmentEvent_orderId_occurredAt_idx" ON "ShipmentEvent"("orderId", "occurredAt" DESC);
CREATE INDEX IF NOT EXISTS "ShipmentEvent_status_idx" ON "ShipmentEvent"("status");
ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_shipmentId_fkey"
    FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShipmentEvent" ADD CONSTRAINT "ShipmentEvent_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
