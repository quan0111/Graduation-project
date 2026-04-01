// ProductInfo.tsx
import { Star } from "lucide-react";
import type { IProduct } from "@/modules/product/types";

export const ProductInfo: React.FC<{ product: IProduct }> = ({ product }) => {
  const reviews = product.Review ?? [];

  // 👉 tính rating trung bình từ Review
  const rating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
      : 0;

  const reviewCount = reviews.length;

  const format = (v: number) =>
    new Intl.NumberFormat("vi-VN").format(v);

  return (
    <>
      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">
        {product.name}
      </h1>

      {/* Rating + meta */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => {
            const filled = i < Math.floor(rating);

            return (
              <Star
                key={i}
                size={16}
                className={`${
                  filled
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            );
          })}

          <span className="ml-1 font-medium text-gray-800">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Reviews */}
        <span>{format(reviewCount)} đánh giá</span>

        {/* Category */}
        {product.Category?.name && (
          <span>Danh mục: {product.Category.name}</span>
        )}

        {/* Shop */}
        {product.Shop?.name && (
          <span>Shop: {product.Shop.name}</span>
        )}
      </div>
    </>
  );
};