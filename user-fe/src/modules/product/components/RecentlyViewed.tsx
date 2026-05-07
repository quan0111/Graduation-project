import { Link } from "react-router-dom";
import { Clock } from "lucide-react";

import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { ProductCard } from "./productCard";

export const RecentlyViewed = () => {
  const { recentProducts, clearRecentlyViewed } = useRecentlyViewed();

  if (!recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-slate-900">Sản phẩm đã xem gần đây</h2>
        </div>
        <button
          onClick={clearRecentlyViewed}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recentProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group"
          >
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </section>
  );
};
