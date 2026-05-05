import { useGetProduct } from "../api/get-product";
import type { IProduct } from "../types";
import type { IShop } from "@/modules/seller/types";

import { FilterSidebar } from "../components/sideBar";
import { ProductGrid } from "../components/productGrid";
import { ProductToolbar } from "../components/toolBar";

import { useMemo, useState } from "react";
import { useProducts } from "../hooks/useProduct";
import { useDebounce } from "@/hook/useDebounce";

/* ---------- PAGE ---------- */

export default function ProductPage() {
  const { data: productsData, isLoading } = useGetProduct();

  const apiProducts: IProduct[] = (productsData as unknown as IProduct[]) || [];

  /* 🔥 SEARCH */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const shops = useMemo(() => {
    const shopMap = new Map<number, IShop>();
    apiProducts.forEach((p) => {
      if (p.shop && !shopMap.has(p.shop.id)) {
        shopMap.set(p.shop.id, p.shop);
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

  const { products, filters, setFilters } = useProducts(apiProducts);

  /* 🔥 APPLY SEARCH */
  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [products, debouncedSearch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid lg:grid-cols-4 gap-8 p-8">
      <FilterSidebar
        filters={filters}
        setFilters={setFilters}
        priceRanges={priceRanges}
        shops={shops}
      />

      <div className="lg:col-span-3 space-y-4">

        {/* 🔥 SEARCH INPUT */}
        <input
          placeholder="Tìm sản phẩm..."
          className="w-full border p-2 rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ProductToolbar count={filtered.length} />
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}