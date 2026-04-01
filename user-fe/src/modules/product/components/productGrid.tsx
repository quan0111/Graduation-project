import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "./productCard";
import { Pagination } from "@/components/pagination"; // chỉnh path nếu khác
import type { IProduct } from "../types";

interface ProductGridProps {
  products: IProduct[];
}

export const ProductGrid = ({ products }: ProductGridProps) => {
  const [page, setPage] = useState(1);
  const pageSize = 10; // 👉 5 item / hàng x 2 hàng

  const totalPages = Math.ceil(products.length / pageSize);

  // reset page khi data đổi (filter)
  useEffect(() => {
    setPage(1);
  }, [products]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [page, products]);

  return (
    <>
      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {paginatedProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </>
  );
};