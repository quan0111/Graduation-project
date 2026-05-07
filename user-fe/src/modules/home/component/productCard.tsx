import { Star } from "lucide-react";
import { Link } from "react-router-dom";

import type { IProduct } from "@/modules/product/types";

interface ProductCardProps {
  product: IProduct;
  onClick?: (product: IProduct) => void;
}

const getImageUrl = (product: IProduct) =>
  product.images?.find((img) => img.is_primary)?.url ?? product.images?.[0]?.url ?? "/placeholder.png";

const getRating = (product: IProduct) => {
  if (!product.reviews?.length) {
    return 0;
  }

  const ratingTotal = product.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return ratingTotal / product.reviews.length;
};

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const rating = getRating(product);

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={() => onClick?.(product)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-orange-50">
        <img
          src={getImageUrl(product)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{product.shop?.name ?? "Marketplace"}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{product.name}</h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating > 0 ? rating.toFixed(1) : "Mới"}</span>
          </div>
          <span className="text-base font-bold text-orange-600">{product.price.toLocaleString("vi-VN")}đ</span>
        </div>
      </div>
    </Link>
  );
};
