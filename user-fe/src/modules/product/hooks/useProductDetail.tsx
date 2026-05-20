import { useState, useMemo, useEffect } from "react";
import type { IProduct, IProductVariant } from "../types";

export const useProductDetail = (product?: IProduct) => {
  const [selectedVariant, setSelectedVariant] =
    useState<IProductVariant | null>(null);

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const price = useMemo(() => {
    const basePrice = selectedVariant?.price || product?.price || 0;
    const salePrice = selectedVariant?.activeFlashSale?.salePrice ?? product?.activeFlashSale?.salePrice;
    return salePrice && salePrice > 0 ? Math.min(basePrice, salePrice) : basePrice;
  }, [selectedVariant, product]);

  const originalPrice = selectedVariant?.price || product?.price || 0;

  const stock = selectedVariant?.stock ?? product?.stock ?? product?.totalStock ?? 0;

  return {
    selectedVariant,
    setSelectedVariant,
    price,
    originalPrice,
    stock,
  };
};
