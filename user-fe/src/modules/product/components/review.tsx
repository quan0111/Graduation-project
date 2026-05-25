import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";
import { ReviewForm } from "@/modules/review/components/reviewForm";
import { useReviewsByProduct } from "@/modules/review/api/get-review";

type ReviewFilter = "all" | "5" | "4" | "comment";

const filterOptions: Array<{ value: ReviewFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "comment", label: "Có bình luận" },
];

const RatingStars = ({ value, size = 18 }: { value: number; size?: number }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map((star) => {
      const fillPercent = Math.max(0, Math.min(1, value - (star - 1))) * 100;

      return (
        <span key={star} className="relative inline-flex" style={{ width: size, height: size }}>
          <Star size={size} className="absolute left-0 top-0 text-gray-300" />
          <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
            <Star size={size} className="fill-[#ee4d2d] text-[#ee4d2d]" />
          </span>
        </span>
      );
    })}
  </div>
);

export const ProductReviews = ({
  productId,
  userId,
}: {
  productId: number;
  userId?: number;
}) => {
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const { data: reviews = [], isLoading } = useReviewsByProduct(productId);

  const rating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }
    return reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review: any) => {
      if (filter === "5") {
        return Number(review.rating) === 5;
      }
      if (filter === "4") {
        return Number(review.rating) === 4;
      }
      if (filter === "comment") {
        return Boolean(review.comment?.trim());
      }
      return true;
    });
  }, [filter, reviews]);

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);
    await queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId] });
    await queryClient.invalidateQueries({ queryKey: ["reviews", "stats", productId] });
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">Đang tải đánh giá...</div>;
  }

  const reviewButton = userId ? (
    <Button onClick={() => setShowReviewForm(true)} variant="outline">
      Viết đánh giá
    </Button>
  ) : null;

  if (!reviews.length) {
    return (
      <div>
        <div className="mb-4 flex justify-end">{reviewButton}</div>
        <div className="py-8 text-center text-slate-500">Chưa có đánh giá</div>
        {showReviewForm && userId && (
          <ReviewForm
            productId={productId}
            userId={userId}
            onCancel={() => setShowReviewForm(false)}
            onSuccess={handleReviewSuccess}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">{reviewButton}</div>

      <div className="mb-10 flex flex-col gap-6 bg-[#fff8f5] p-8 md:flex-row md:items-center md:gap-10">
        <div>
          <div className="text-[36px] text-[#ee4d2d]">{rating.toFixed(1)}</div>
          <div className="text-[#ee4d2d]">trên 5</div>
          <div className="mt-2">
            <RatingStars value={rating} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={
                  active
                    ? "border border-[#ee4d2d] bg-[#ee4d2d] px-5 py-2 text-white"
                    : "border border-slate-200 bg-white px-5 py-2 text-slate-700 hover:border-[#ee4d2d]"
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        {filteredReviews.length === 0 ? (
          <div className="py-8 text-center text-slate-500">Không có đánh giá phù hợp</div>
        ) : (
          filteredReviews.map((review: any) => {
            const user = review.user || review.User;
            const createdAt = review.createdAt || review.created_at;

            return (
              <div key={review.id} className="border-b pb-8">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <p className="font-medium">{user?.fullName || user?.full_name || "Người dùng"}</p>
                    <div className="mt-1">
                      <RatingStars value={Number(review.rating || 0)} size={14} />
                    </div>
                    {createdAt && (
                      <p className="mt-2 text-sm text-[#757575]">
                        {formatDateTime(createdAt)}
                      </p>
                    )}
                    {review.comment && <p className="mt-4 leading-7">{review.comment}</p>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showReviewForm && userId && (
        <ReviewForm
          productId={productId}
          userId={userId}
          onCancel={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};
