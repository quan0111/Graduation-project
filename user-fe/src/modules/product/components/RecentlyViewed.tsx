import { Clock } from "lucide-react";

import { useWishlistActions } from "@/modules/wishlist/hooks/useWishlistActions";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { ProductCard } from "./productcard";

const TEXT = {
  title: "Sản phẩm đã xem gần đây",
  clear: "Xóa tất cả",
};

export const RecentlyViewed = () => {
  const { recentProducts, clearRecentlyViewed } = useRecentlyViewed();
  const { wishlistIds, pendingProductId, toggleWishlist } = useWishlistActions();

  if (!recentProducts || recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-slate-900">{TEXT.title}</h2>
        </div>
        <button
          type="button"
          onClick={clearRecentlyViewed}
          className="text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          {TEXT.clear}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {recentProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isWishlisted={wishlistIds.has(product.id)}
            wishlistPending={pendingProductId === product.id}
            onToggleWishlist={toggleWishlist}
          />
        ))}
      </div>
    </section>
  );
};
