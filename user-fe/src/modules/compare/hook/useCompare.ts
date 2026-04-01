// hooks/useCompare.ts
import { useState, useMemo, useCallback } from "react";

interface Product {
  id: string | number;
  specs?: Record<string, any>;
  price?: number;
  rating?: number;
}

export const useCompare = (initial: Product[] = []) => {
  const [list, setList] = useState<Product[]>(initial);

  // 👉 remove
  const remove = useCallback((id: string | number) => {
    setList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // 👉 add (safe + tránh stale state)
  const add = useCallback((allProducts: Product[]) => {
    setList((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const available = allProducts.find((p) => !ids.has(p.id));

      if (!available || prev.length >= 4) return prev;

      return [...prev, available];
    });
  }, []);

  // 👉 collect specs (safe)
  const allSpecs = useMemo(() => {
    const specsSet = new Set<string>();

    list.forEach((p) => {
      Object.keys(p.specs ?? {}).forEach((key) => {
        specsSet.add(key);
      });
    });

    return Array.from(specsSet);
  }, [list]);

  return {
    list,
    remove,
    add,
    allSpecs,
  };
};