ALTER TYPE "ProductStatus" ADD VALUE IF NOT EXISTS 'APPROVAL';

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT;

UPDATE "Product"
SET "status" = 'APPROVAL'
WHERE "status"::text = 'APROVAL';

ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_productId_fkey";
ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_variantId_fkey";
ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_shopId_fkey";

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_variantId_fkey"
  FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_shopId_fkey"
  FOREIGN KEY ("shopId") REFERENCES "Shop"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Coupon" DROP CONSTRAINT IF EXISTS "Coupon_applicableShopId_fkey";
ALTER TABLE "Coupon"
  ADD CONSTRAINT "Coupon_applicableShopId_fkey"
  FOREIGN KEY ("applicableShopId") REFERENCES "Shop"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
