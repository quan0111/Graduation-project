CREATE TABLE IF NOT EXISTS "CouponProductTarget" (
  "couponId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,

  CONSTRAINT "CouponProductTarget_pkey" PRIMARY KEY ("couponId", "productId"),
  CONSTRAINT "CouponProductTarget_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CouponProductTarget_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "CouponProductTarget" ("couponId", "productId")
SELECT "id", "applicableProductId"
FROM "Coupon"
WHERE "applicableProductId" IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS "CouponProductTarget_productId_idx" ON "CouponProductTarget"("productId");
