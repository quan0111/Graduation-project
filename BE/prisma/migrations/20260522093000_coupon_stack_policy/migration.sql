ALTER TABLE "Coupon"
ADD COLUMN IF NOT EXISTS "scope" TEXT NOT NULL DEFAULT 'ORDER',
ADD COLUMN IF NOT EXISTS "applicableCategoryId" INTEGER,
ADD COLUMN IF NOT EXISTS "applicableProductId" INTEGER;

UPDATE "Coupon"
SET "scope" = 'SHOP'
WHERE "applicableShopId" IS NOT NULL
  AND ("scope" IS NULL OR "scope" = 'ORDER');

CREATE INDEX IF NOT EXISTS "Coupon_scope_idx" ON "Coupon"("scope");
CREATE INDEX IF NOT EXISTS "Coupon_applicableShopId_idx" ON "Coupon"("applicableShopId");
CREATE INDEX IF NOT EXISTS "Coupon_applicableCategoryId_idx" ON "Coupon"("applicableCategoryId");
CREATE INDEX IF NOT EXISTS "Coupon_applicableProductId_idx" ON "Coupon"("applicableProductId");
