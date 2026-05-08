-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PRODUCT_BANNED';

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Shop" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Shop_isActive_idx" ON "Shop"("isActive");
