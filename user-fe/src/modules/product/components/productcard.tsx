import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getStoredStorefrontUser } from "@/lib/auth-storage";
import { addGuestCartItem } from "@/lib/guest-cart";
import { useAddItem } from "@/modules/cart/api/add-item";
import type { IProduct } from "@/modules/product/types";
import { getProductImageUrl } from "@/modules/product/utils/image";
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
  new: "Mới",
  addToCart: "Thêm vào giỏ",
  adding: "Đang thêm...",
  addSavedGuest: "Đã lưu sản phẩm, đăng nhập để đồng bộ giỏ hàng",
  loginForCart: "Bạn cần đăng nhập để thêm vào giỏ hàng",
  missingShop: "Sản phẩm chưa có thông tin shop",
  addSuccess: "Đã thêm vào giỏ hàng",
  addFailed: "Không thể thêm vào giỏ hàng",
  outOfStock: "Hết hàng",
  wishlistAdd: "Thêm vào wishlist",
  wishlistRemove: "Bỏ khỏi wishlist",
};

const getAvgRating = (reviews?: Array<{ rating?: number }>) => {
  if (!reviews?.length) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return total / reviews.length;
};

const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

const getAvailableFlashSaleStock = (product: IProduct) => {
  const sale = product.activeFlashSale;
  if (!sale || sale.stockLimit === null || sale.stockLimit === undefined) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(0, Number(sale.stockLimit || 0) - Number(sale.soldCount || 0));
};

const getPurchasableVariant = (product: IProduct) => {
  const variants = product.variants ?? [];
  if (!variants.length) {
    return null;
  }

  const sale = product.activeFlashSale;
  const flashSaleHasStock = getAvailableFlashSaleStock(product) > 0;
  if (sale?.variantId && flashSaleHasStock) {
    const saleVariant = variants.find((variant) => variant.id === sale.variantId && Number(variant.stock || 0) > 0);
    if (saleVariant) {
      return saleVariant;
    }
  }

  return variants.find((variant) => Number(variant.stock || 0) > 0) ?? null;
};

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
  const purchasableVariant = getPurchasableVariant(product);
  const isOutOfStock = !purchasableVariant || getAvailableFlashSaleStock(product) <= 0;

  const requireLogin = (message: string) => {
    toast.error(message);
    navigate("/login", { state: { redirect: window.location.pathname } });
  };

  const handleAdd = async () => {
    if (isOutOfStock || !purchasableVariant) {
      toast.error(TEXT.outOfStock);
      return;
    }

    if (!product.shop?.id) {
      toast.error(TEXT.missingShop);
      return;
    }

    if (!storefrontUser && product.shop?.id) {
      const saved = addGuestCartItem({
        productId: product.id,
        variantId: purchasableVariant.id,
        shopId: product.shop.id,
        quantity: 1,
        availableStock: purchasableVariant.stock,
      });
      if (!saved) {
        toast.error(TEXT.outOfStock);
        return;
      }
      toast.success(TEXT.addSavedGuest);
      navigate("/login", { state: { redirect: window.location.pathname } });
      return;
    }

    if (!storefrontUser) {
      requireLogin(TEXT.loginForCart);
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId: product.id,
        variantId: purchasableVariant.id,
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
              src={getProductImageUrl(product)}
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
            <span className="text-base font-bold text-orange-600">{formatVnd(displayPrice)}</span>
            {hasFlashSale ? (
              <span className="ml-2 text-xs text-slate-400 line-through">{formatVnd(product.price)}</span>
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
          disabled={addMutation.isPending || isOutOfStock}
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? TEXT.outOfStock : addMutation.isPending ? TEXT.adding : TEXT.addToCart}
        </Button>
      </div>
    </article>
  );
};
