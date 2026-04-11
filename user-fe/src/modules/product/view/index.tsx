import { useGetProduct } from "../api/get-product";
import type { IProduct } from "../types";
import type { IShop } from "@/modules/seller/types";
import type { Filters } from "../types/filter";

import { FilterSidebar } from "../components/sideBar";
import { ProductGrid } from "../components/productGrid";
import { ProductToolbar } from "../components/toolBar";
import { useState, useMemo } from "react";
import { useProducts } from "../hooks/useProduct";

/* ---------- PAGE ---------- */

export default function ProductPage() {
  const { data: productsData, isLoading } = useGetProduct();

  // Transform API data
  const apiProducts: IProduct[] = productsData?.data?.data || [];
  
  // Get unique shops from products
  const shops = useMemo(() => {
    const shopMap = new Map<number, IShop>();
    apiProducts.forEach((p) => {
      if (p.Shop && !shopMap.has(p.Shop.id)) {
        shopMap.set(p.Shop.id, p.Shop);
      }
    });
    return Array.from(shopMap.values());
  }, [apiProducts]);

  const priceRanges = [
    { label: "Dưới 500k", min: 0, max: 500000 },
    { label: "500k - 1M", min: 500000, max: 1000000 },
    { label: "1M - 3M", min: 1000000, max: 3000000 },
    { label: "Trên 3M", min: 3000000, max: Infinity },
  ];

  // Use the existing useProducts hook for filtering
  const { products: filtered, filters, setFilters } = useProducts(apiProducts);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8 p-8">
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        priceRanges={priceRanges}
        shops={shops}
      />

      <div className="lg:col-span-3">
        <ProductToolbar count={filtered.length} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}