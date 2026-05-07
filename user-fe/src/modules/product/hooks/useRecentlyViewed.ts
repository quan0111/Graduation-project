import { useEffect, useState } from "react";
import type { IProduct } from "../types";

const STORAGE_KEY = "recently_viewed_products";
const MAX_RECENT = 10;

export const useRecentlyViewed = () => {
  const [recentProducts, setRecentProducts] = useState<IProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentProducts(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
    }
  }, []);

  // Add product to recently viewed
  const addRecentlyViewed = (product: IProduct) => {
    if (typeof window === "undefined") return;

    setRecentProducts((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      // Add to beginning
      const updated = [product, ...filtered].slice(0, MAX_RECENT);

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to save recently viewed:", error);
      }

      return updated;
    });
  };

  // Clear recently viewed
  const clearRecentlyViewed = () => {
    if (typeof window === "undefined") return;

    setRecentProducts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear recently viewed:", error);
    }
  };

  return {
    recentProducts,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
};
