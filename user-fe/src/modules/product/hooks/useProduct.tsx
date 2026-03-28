// hooks/useProducts.ts
import { useState, useMemo } from 'react';
import type { IProduct } from '../types';

type PriceRange = {
  min: number;
  max: number;
};

interface IFilters {
  price: PriceRange[];
  rating: number | null;
  shops: string[]; // dùng tên shop thay vì vendor
  status?: string[];
}

export const useProducts = (products: IProduct[]) => {
  const [filters, setFilters] = useState<IFilters>({
    price: [],
    rating: null,
    shops: [],
    status: [],
  });

  const filtered = useMemo(() => {
    return products.filter((p) => {
      // ❌ Bỏ product bị xóa / banned
      if (p.deleted_at) return false;
      if (p.status === 'BANNED') return false;

      // ✅ FILTER PRICE
      if (filters.price.length > 0) {
        const matchPrice = filters.price.some(
          (range) => p.price >= range.min && p.price <= range.max
        );
        if (!matchPrice) return false;
      }

      // ✅ FILTER RATING (tính từ Review)
      if (filters.rating) {
        const avgRating =
          p.Review && p.Review.length > 0
            ? p.Review.reduce((acc, r) => acc + (r.rating || 0), 0) /
              p.Review.length
            : 0;

        if (avgRating < filters.rating) return false;
      }

      // ✅ FILTER SHOP
      if (filters.shops.length > 0) {
        const shopName = p.Shop?.name;
        if (!shopName || !filters.shops.includes(shopName)) {
          return false;
        }
      }

      // ✅ FILTER STATUS (optional)
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(p.status)) return false;
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