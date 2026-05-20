CREATE TABLE IF NOT EXISTS "OrderShopPackage" (
    "id" SERIAL PRIMARY KEY,
    "orderId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "OrderShopPackage_orderId_shopId_key" ON "OrderShopPackage"("orderId", "shopId");
CREATE INDEX IF NOT EXISTS "OrderShopPackage_orderId_idx" ON "OrderShopPackage"("orderId");
CREATE INDEX IF NOT EXISTS "OrderShopPackage_shopId_idx" ON "OrderShopPackage"("shopId");
CREATE INDEX IF NOT EXISTS "OrderShopPackage_status_idx" ON "OrderShopPackage"("status");

ALTER TABLE "OrderShopPackage" DROP CONSTRAINT IF EXISTS "OrderShopPackage_orderId_fkey";
ALTER TABLE "OrderShopPackage"
  ADD CONSTRAINT "OrderShopPackage_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderShopPackage" DROP CONSTRAINT IF EXISTS "OrderShopPackage_shopId_fkey";
ALTER TABLE "OrderShopPackage"
  ADD CONSTRAINT "OrderShopPackage_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "OrderShopPackage" ("orderId", "shopId", "status")
SELECT DISTINCT oi."orderId", oi."shopId", o."status"
FROM "OrderItem" oi
JOIN "Order" o ON o."id" = oi."orderId"
WHERE oi."deletedAt" IS NULL
ON CONFLICT ("orderId", "shopId") DO NOTHING;

ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "gatewayRefundStatus" TEXT;
ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "gatewayRefundTransactionId" TEXT;
ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "gatewayRefundedAt" TIMESTAMP(3);
