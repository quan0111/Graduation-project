import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { CatalogHeader } from "@/modules/product/components/catalogHeader";
import { CatalogSearch } from "@/modules/product/components/catalogSearch";
import { FilterSidebar } from "@/modules/product/components/sideBar";
import { ProductGrid } from "@/modules/product/components/productGrid";
import { ProductToolbar } from "@/modules/product/components/toolBar";
import { useGetProduct } from "@/modules/product/api/get-product";
import { useProducts } from "@/modules/product/hooks/useProduct";
import type { IProduct } from "@/modules/product/types";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import type { IShop } from "@/modules/seller/types";
import { RecommendationSection } from "@/modules/recommendation/components/recommendation-section";
import { useRecommendations } from "@/modules/recommendation/api/get-recommendations";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

const TEXT = {
  under500: "Dưới 500k",
  over3m: "Trên 3M",
  loading: "Đang tải sản phẩm...",
  recommendationTitle: "Bạn có thể thích",
  recommendationSubtitle: "Danh sách gợi ý được cập nhật theo hành vi xem và thêm giỏ hàng gần đây.",
};

export default function ProductPage() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category")?.toLowerCase().trim() ?? "";
  const categoryIdParam = Number(searchParams.get("categoryId") ?? searchParams.get("category_id") ?? NaN);
  const categoryId = Number.isFinite(categoryIdParam) ? categoryIdParam : undefined;
  const searchParam = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const { data: rawProducts = [], isLoading } = useGetProduct({
    page: 1,
    limit: 100,
    search: debouncedSearch || undefined,
    categoryId,
  });
  const { data: recommendedProducts = [], isLoading: recommendationLoading } = useRecommendations({ topK: 10 });
  const { trackClick } = useTrackProductBehavior();

  const apiProducts: IProduct[] = useMemo(
    () => rawProducts.map((product) => normalizeProduct(product as Record<string, unknown>)),
    [rawProducts],
  );

  useEffect(() => {
    setSearch(searchParam);
    setDebouncedSearch(searchParam.trim().toLowerCase());
  }, [searchParam]);

  const shops = useMemo(() => {
    const shopMap = new Map<number, IShop>();
    apiProducts.forEach((product) => {
      if (product.shop?.id && !shopMap.has(product.shop.id)) {
        shopMap.set(product.shop.id, product.shop);
      }
    });
    return Array.from(shopMap.values());
  }, [apiProducts]);

  const priceRanges = [
    { label: TEXT.under500, min: 0, max: 500000 },
    { label: "500k - 1M", min: 500000, max: 1000000 },
    { label: "1M - 3M", min: 1000000, max: 3000000 },
    { label: TEXT.over3m, min: 3000000, max: Infinity },
  ];

  const { products, filters, setFilters } = useProducts(apiProducts);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = debouncedSearch.length === 0 || product.name.toLowerCase().includes(debouncedSearch);
      if (!matchSearch) {
        return false;
      }

      if (!categoryFilter) {
        return true;
      }

      const categoryName = product.category?.name?.toLowerCase() ?? "";
      const categorySlug = product.category?.slug?.toLowerCase() ?? "";
      return categoryName.includes(categoryFilter) || categorySlug.includes(categoryFilter);
    });
  }, [products, debouncedSearch, categoryFilter]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <p className="text-slate-600">{TEXT.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] pb-12 pt-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 md:px-6">
        <CatalogHeader totalProducts={apiProducts.length} />

        <div className="grid gap-6 lg:grid-cols-4">
          <FilterSidebar filters={filters} setFilters={setFilters} priceRanges={priceRanges} shops={shops} />

          <div className="space-y-4 lg:col-span-3">
            <CatalogSearch value={search} onChange={setSearch} />
            <ProductToolbar count={filteredProducts.length} activeCategory={categoryFilter || undefined} />
            <ProductGrid products={filteredProducts} />
          </div>
        </div>

        <RecommendationSection
          title={TEXT.recommendationTitle}
          subtitle={TEXT.recommendationSubtitle}
          products={recommendedProducts}
          isLoading={recommendationLoading}
          onProductClick={(product) => trackClick(product.id, { page: "products", source: "recommendation" })}
        />
      </div>
    </div>
  );
}
