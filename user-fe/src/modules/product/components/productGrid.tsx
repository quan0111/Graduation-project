import { useEffect, useMemo, useState } from "react";

import { Pagination } from "@/components/pagination";
import { ProductCard } from "@/modules/product/components/productCard";
import type { IProduct } from "@/modules/product/types";

interface ProductGridProps {
  products: IProduct[];
}

const PAGE_SIZE = 12;

export const ProductGrid = ({ products }: ProductGridProps) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(products.length / PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [products]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [page, products]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-8 text-center">
        <p className="text-sm font-medium text-slate-700">Không tìm thấy sản phẩm phù hợp.</p>
        <p className="mt-1 text-xs text-slate-500">Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {paginatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(nextPage) => {
            setPage(nextPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
};
