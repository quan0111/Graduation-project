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
    return selectedVariant?.price || product?.price || 0;
  }, [selectedVariant, product]);

  const stock = selectedVariant?.stock ?? product?.stock ?? product?.totalStock ?? 0;

  return {
    selectedVariant,
    setSelectedVariant,
    price,
    stock,
  };
};
