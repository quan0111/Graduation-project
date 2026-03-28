// hooks/useProductDetail.ts
import { useState, useMemo } from "react";
import type { IProduct, IProductVariant } from "../types";

export const useProductDetail = (product: IProduct) => {
  const [selectedVariant, setSelectedVariant] = useState<IProductVariant | null>(
    product.Variants?.[0] || null
  );

  const price = useMemo(() => {
    return selectedVariant?.price || product.price;
  }, [selectedVariant, product.price]);

  const stock = selectedVariant?.stock || 0;

  return {
    selectedVariant,
    setSelectedVariant,
    price,
    stock,
  };
};