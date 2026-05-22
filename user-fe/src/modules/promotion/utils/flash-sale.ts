import type { IActiveFlashSale, IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";

import type { ActiveFlashSale, ActiveFlashSaleItem } from "../api/flash-sale";

const FALLBACK_CATEGORY = "Khác";
const FALLBACK_SHOP = "Marketplace";

export const buildFlashSalePayload = (
  sale: ActiveFlashSale,
  item: ActiveFlashSaleItem,
): IActiveFlashSale => ({
  id: Number(item.id),
  flashSaleId: Number(sale.id),
  variantId: item.variantId ?? null,
  salePrice: Number(item.salePrice),
  stockLimit: item.stockLimit ?? null,
  soldCount: Number(item.soldCount || 0),
  purchaseLimit: item.purchaseLimit ?? null,
  startsAt: sale.startsAt,
  endsAt: sale.endsAt,
});

export const getFlashSaleProducts = (flashSales: ActiveFlashSale[], limit?: number): IProduct[] => {
  const productMap = new Map<number, IProduct>();

  flashSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!item.product) {
        return;
      }

      const product = normalizeProduct({
        ...item.product,
        activeFlashSale: buildFlashSalePayload(sale, item),
      });
      const existing = productMap.get(product.id);
      const existingSalePrice = existing?.activeFlashSale?.salePrice ?? Number.POSITIVE_INFINITY;

      if (!existing || Number(item.salePrice) < existingSalePrice) {
        productMap.set(product.id, product);
      }
    });
  });

  const products = Array.from(productMap.values());
  return typeof limit === "number" ? products.slice(0, limit) : products;
};

export const getFlashSaleDisplayPrice = (product: IProduct) => {
  const salePrice = product.activeFlashSale?.salePrice;
  return salePrice && salePrice > 0 && salePrice < product.price ? Number(salePrice) : product.price;
};

export const getFlashSaleDiscountPercent = (product: IProduct) => {
  const displayPrice = getFlashSaleDisplayPrice(product);

  if (!product.price || displayPrice >= product.price) {
    return 0;
  }

  return Math.round((1 - displayPrice / product.price) * 100);
};

export const getRemainingFlashSaleStock = (product: IProduct) => {
  const sale = product.activeFlashSale;

  if (!sale?.stockLimit) {
    return null;
  }

  return Math.max(sale.stockLimit - sale.soldCount, 0);
};

export const getProductCategoryLabel = (product: IProduct) => {
  return product.category?.name?.trim() || FALLBACK_CATEGORY;
};

export const getProductShopLabel = (product: IProduct) => {
  return product.shop?.name?.trim() || FALLBACK_SHOP;
};
