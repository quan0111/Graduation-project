import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { ProductCard } from "@/modules/product/components/productcard";
import { normalizeProduct } from "@/modules/product/utils/normalize-product";
import { useWishlistActions } from "@/modules/wishlist/hooks/useWishlistActions";

export default function WishlistPage() {
  const { wishlist, wishlistIds, pendingProductId, toggleWishlist, isLoading, isError } = useWishlistActions();
  const products = wishlist
    .map((item) => item.product)
    .filter(Boolean)
    .map((product) => normalizeProduct(product as unknown as Record<string, unknown>));

  return (
    <main className="min-h-screen bg-[#fffaf6] px-4 py-8 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Yêu thích</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Sản phẩm yêu thích</h1>
              <p className="mt-2 text-sm text-slate-500">
                Lưu các sản phẩm cần theo dõi để quay lại mua nhanh hơn.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
              <Heart className="size-4 fill-current" />
              {products.length} sản phẩm
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-orange-100">
            Đang tải wishlist...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-3xl bg-white p-8 text-center text-sm text-rose-500 shadow-sm ring-1 ring-orange-100">
            Không thể tải wishlist. Vui lòng thử lại sau.
          </div>
        ) : null}

        {!isLoading && !isError && products.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-orange-100">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <Heart className="size-7" />
            </div>
            <h2 className="text-xl font-semibold text-slate-950">Chưa có sản phẩm yêu thích</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Bấm biểu tượng tim trên sản phẩm để lưu lại danh sách quan tâm.
            </p>
            <Link to="/products" className={`${buttonVariants()} mt-6 bg-orange-600 hover:bg-orange-700`}>
              Khám phá sản phẩm
            </Link>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.has(product.id)}
                wishlistPending={pendingProductId === product.id}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
