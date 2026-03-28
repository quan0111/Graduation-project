// app/products/page.tsx
import { useProducts } from "@/hooks/useProducts";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductToolbar } from "@/components/products/ProductToolbar";

export default function Page({ products }) {
  const { products: filtered, filters, setFilters } = useProducts(products);

  const shops = [
    ...new Set(products.map(p => p.Shop?.name).filter(Boolean))
  ];

  const priceRanges = [
    { label: "Dưới 500k", min: 0, max: 500000 },
    { label: "500k - 1M", min: 500000, max: 1000000 },
    { label: "1M - 3M", min: 1000000, max: 3000000 },
  ];

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