import { ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";
import type { IProduct } from "@/modules/product/types";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

const getAvgRating = (reviews?: Array<{ rating?: number }>) => {
  if (!reviews?.length) {
    return 0;
  }
  const total = reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return total / reviews.length;
};

const getImageUrl = (product: IProduct) =>
  product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url ?? "/placeholder.png";

export const ProductCard = ({ product }: { product: IProduct }) => {
  const addMutation = useAddItem();
  const { trackAddToCart, trackClick } = useTrackProductBehavior();

  const handleAdd = async () => {
    if (!product.shop?.id) {
      toast.error("Sản phẩm chưa có thông tin shop");
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
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      console.error(error);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const rating = getAvgRating(product.reviews as Array<{ rating?: number }>);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/product/${product.id}`} onClick={() => trackClick(product.id, { page: "products", source: "grid_card" })}>
        <div className="aspect-square overflow-hidden bg-orange-50">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{product.shop?.name ?? "Marketplace"}</p>
        <Link to={`/product/${product.id}`} onClick={() => trackClick(product.id, { page: "products", source: "grid_card" })}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{product.name}</h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-bold text-orange-600">{product.price.toLocaleString("vi-VN")}đ</span>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating > 0 ? rating.toFixed(1) : "Mới"}</span>
          </div>
        </div>

        <Button
          className="mt-1 h-9 w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700"
          onClick={handleAdd}
          disabled={addMutation.isPending}
        >
          <ShoppingCart className="h-4 w-4" />
          {addMutation.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
        </Button>
      </div>
    </article>
  );
};
