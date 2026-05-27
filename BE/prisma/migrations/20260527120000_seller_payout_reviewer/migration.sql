-- Track the admin who reviewed a seller payout request.
ALTER TABLE "SellerPayout"
ADD COLUMN "reviewedAt" TIMESTAMP(3),
ADD COLUMN "reviewedById" INTEGER;

CREATE INDEX "SellerPayout_reviewedById_idx" ON "SellerPayout"("reviewedById");

ALTER TABLE "SellerPayout"
ADD CONSTRAINT "SellerPayout_reviewedById_fkey"
FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
