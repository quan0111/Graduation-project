import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getStoredStorefrontUser } from "@/lib/auth-storage";
import { addGuestCartItem } from "@/lib/guest-cart";
import { useAddItem } from "@/modules/cart/api/add-item";
import type { IProduct } from "@/modules/product/types";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

interface ProductCardProps {
  product: IProduct;
  isWishlisted?: boolean;
  wishlistPending?: boolean;
  onToggleWishlist?: (product: IProduct) => void;
}

const TEXT = {
  marketplace: "Marketplace",
  flashSale: "Flash sale",
  new: "M\u1edbi",
  addToCart: "Th\u00eam v\u00e0o gi\u1ecf",
  adding: "\u0110ang th\u00eam...",
  addSavedGuest: "\u0110\u00e3 l\u01b0u s\u1ea3n ph\u1ea9m, \u0111\u0103ng nh\u1eadp \u0111\u1ec3 \u0111\u1ed3ng b\u1ed9 gi\u1ecf h\u00e0ng",
  loginForCart: "B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng",
  missingShop: "S\u1ea3n ph\u1ea9m ch\u01b0a c\u00f3 th\u00f4ng tin shop",
  addSuccess: "\u0110\u00e3 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng",
  addFailed: "Kh\u00f4ng th\u1ec3 th\u00eam v\u00e0o gi\u1ecf h\u00e0ng",
  wishlistAdd: "Th\u00eam v\u00e0o wishlist",
  wishlistRemove: "B\u1ecf kh\u1ecfi wishlist",
};

const getAvgRating = (reviews?: Array<{ rating?: number }>) => {
  if (!reviews?.length) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return total / reviews.length;
};

const getImageUrl = (product: IProduct) =>
  product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url ?? "/placeholder.png";

export const ProductCard = ({
  product,
  isWishlisted = false,
  wishlistPending = false,
  onToggleWishlist,
}: ProductCardProps) => {
  const addMutation = useAddItem();
  const navigate = useNavigate();
  const storefrontUser = getStoredStorefrontUser();
  const { trackAddToCart, trackClick } = useTrackProductBehavior();
  const salePrice = product.activeFlashSale?.salePrice;
  const hasFlashSale = Boolean(salePrice && salePrice > 0 && salePrice < product.price);
  const displayPrice = hasFlashSale ? Number(salePrice) : product.price;

  const requireLogin = (message: string) => {
    toast.error(message);
    navigate("/login", { state: { redirect: window.location.pathname } });
  };

  const handleAdd = async () => {
    if (!storefrontUser && product.shop?.id) {
      addGuestCartItem({
        productId: product.id,
        variantId: product.variants?.[0]?.id ?? null,
        shopId: product.shop.id,
        quantity: 1,
      });
      toast.success(TEXT.addSavedGuest);
      navigate("/login", { state: { redirect: window.location.pathname } });
      return;
    }

    if (!storefrontUser) {
      requireLogin(TEXT.loginForCart);
      return;
    }

    if (!product.shop?.id) {
      toast.error(TEXT.missingShop);
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId: product.id,
        variantId: product.variants?.[0]?.id ?? null,
        shopId: product.shop.id,
        quantity: 1,
      });

      trackAddToCart(product.id, { page: "products", source: "grid_card" });
      toast.success(TEXT.addSuccess);
    } catch (error) {
      console.error(error);
      toast.error(TEXT.addFailed);
    }
  };

  const rating = getAvgRating(product.reviews as Array<{ rating?: number }>);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative">
        <Link to={`/product/${product.id}`} onClick={() => trackClick(product.id, { page: "products", source: "grid_card" })}>
          <div className="aspect-square overflow-hidden bg-orange-50">
            <img
              src={getImageUrl(product)}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Link>
        {onToggleWishlist ? (
          <button
            type="button"
            aria-label={isWishlisted ? TEXT.wishlistRemove : TEXT.wishlistAdd}
            onClick={() => onToggleWishlist(product)}
            disabled={wishlistPending}
            className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/95 text-orange-600 shadow-sm ring-1 ring-orange-100 transition hover:bg-orange-50 disabled:opacity-60"
          >
            <Heart className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        ) : null}
        {hasFlashSale ? (
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
            {TEXT.flashSale}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{product.shop?.name ?? TEXT.marketplace}</p>
        <Link to={`/product/${product.id}`} onClick={() => trackClick(product.id, { page: "products", source: "grid_card" })}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-orange-600">{displayPrice.toLocaleString("vi-VN")}\u0111</span>
            {hasFlashSale ? (
              <span className="ml-2 text-xs text-slate-400 line-through">{product.price.toLocaleString("vi-VN")}\u0111</span>
            ) : null}
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating > 0 ? rating.toFixed(1) : TEXT.new}</span>
          </div>
        </div>

        <Button
          className="mt-1 h-9 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700"
          onClick={handleAdd}
          disabled={addMutation.isPending}
        >
          <ShoppingCart className="h-4 w-4" />
          {addMutation.isPending ? TEXT.adding : TEXT.addToCart}
        </Button>
      </div>
    </article>
  );
};
