// ProductReviews.tsx
import { Star } from "lucide-react";
import type { IReview } from "@/modules/review/types";

interface ProductReviewsProps {
  reviews?: IReview[];
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews = [],
}) => {
  if (!reviews.length) {
    return (
      <div className="p-4 text-gray-400 italic">
        Chưa có đánh giá nào
      </div>
    );
  }

  const formatDate = (date?: string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-4">
      {reviews.map((r) => {
        const rating = r.rating ?? 0;

        return (
          <div
            key={r.id}
            className="border-b pb-4 last:border-none"
          >
            {/* Author */}
            <p className="font-semibold">
              {r.User?.full_name || "Người dùng"}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <span className="text-xs text-gray-400">
                {formatDate(r.created_at)}
              </span>
            </div>

            {/* Content */}
            <p className="mt-2 text-gray-700 whitespace-pre-line">
              {r.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
};