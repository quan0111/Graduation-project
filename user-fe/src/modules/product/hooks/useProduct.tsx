// hooks/useProducts.ts
import { useState, useMemo } from "react";
import type { IProduct } from "../types";
import type { Filters } from "../types/filter";

export const useProducts = (products: IProduct[]) => {
  const [filters, setFilters] = useState<Filters>({
    price: [],
    rating: undefined,
    shop_ids: [],
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // ❌ bỏ product bị xóa / banned
      if (p.deleted_at) return false;
      if (p.status === "BANNED") return false;

      // ✅ PRICE
      if (filters.price.length > 0) {
        const matchPrice = filters.price.some(
          (range) => p.price >= range.min && p.price <= range.max
        );
        if (!matchPrice) return false;
      }

      // ✅ RATING
      if (filters.rating !== undefined) {
        const avgRating =
          p.Review && p.Review.length > 0
            ? p.Review.reduce((acc, r) => acc + (r.rating || 0), 0) /
              p.Review.length
            : 0;

        if (avgRating < filters.rating) return false;
      }

      // ✅ SHOP (đổi sang shop_ids)
      if (filters.shop_ids.length > 0) {
        const shopId = p.shop_id;
        if (!filters.shop_ids.includes(shopId)) {
          return false;
        }
      }

      return true;
    });
  }, [products, filters]);

  return {
    products: filtered,
    filters,
    setFilters,
  };
};