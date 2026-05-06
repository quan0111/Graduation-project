/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,variantId,shopId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CartItem_cartId_productId_variantId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "shopId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_variantId_shopId_key" ON "CartItem"("cartId", "productId", "variantId", "shopId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
