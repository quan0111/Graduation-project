import { Star } from "lucide-react";
import { Link } from "react-router-dom";

import type { IProduct } from "@/modules/product/types";
import { getProductImageUrl } from "@/modules/product/utils/image";

interface RecommendationCardProps {
  product: IProduct;
  onClick?: (product: IProduct) => void;
}

const TEXT = {
  fallbackCategory: "G\u1ee3i \u00fd cho b\u1ea1n",
  new: "M\u1edbi",
};

const getRating = (product: IProduct) => {
  if (!product.reviews?.length) {
    return 0;
  }

  const total = product.reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return total / product.reviews.length;
};

const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export const RecommendationCard = ({ product, onClick }: RecommendationCardProps) => {
  const rating = getRating(product);

  return (
    <Link
      to={`/product/${product.id}`}
      onClick={() => onClick?.(product)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-orange-50">
        <img
          src={getProductImageUrl(product)}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-orange-500">{product.category?.name ?? TEXT.fallbackCategory}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900">{product.name}</h3>
        {product.recommendationReason ? (
          <p className="line-clamp-2 rounded-lg bg-orange-50 px-2 py-1 text-xs leading-5 text-orange-700">
            {product.recommendationReason}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{rating > 0 ? rating.toFixed(1) : TEXT.new}</span>
          </div>
          <span className="text-base font-bold text-orange-600">{formatVnd(product.price)}</span>
        </div>
      </div>
    </Link>
  );
};
