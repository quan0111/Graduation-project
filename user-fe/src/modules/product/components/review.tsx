// components/review.tsx

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/modules/review/components/reviewForm";
import { useReviewsByProduct } from "@/modules/review/api/get-review";

export const ProductReviews = ({
  productId,
  userId,
}: {
  productId: number;
  userId?: number;
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { data: reviews = [], isLoading } = useReviewsByProduct(productId);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Đang tải đánh giá...</div>;
  }

  if (!reviews.length) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          {userId && (
            <Button onClick={() => setShowReviewForm(true)} variant="outline">
              Viết đánh giá
            </Button>
          )}
        </div>
        <div className="text-center py-8 text-slate-500">Chưa có đánh giá</div>
        {showReviewForm && userId && (
          <ReviewForm
            productId={productId}
            userId={userId}
            onCancel={() => setShowReviewForm(false)}
            onSuccess={() => {
              setShowReviewForm(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    );
  }

  const rating =
    reviews.reduce((a: number, b: any) => a + (b.rating || 0), 0) / reviews.length;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {userId && (
          <Button onClick={() => setShowReviewForm(true)} variant="outline">
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="bg-[#fff8f5] p-8 flex gap-10 items-center mb-10">
        <div>
          <div className="text-[36px] text-[#ee4d2d]">{rating.toFixed(1)}</div>
          <div className="text-[#ee4d2d]">trên 5</div>
          <div className="flex mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={18} className="fill-[#ee4d2d] text-[#ee4d2d]" />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="border px-5 py-2 bg-[#ee4d2d] text-white">Tất Cả</button>
          <button className="border px-5 py-2">5 Sao</button>
          <button className="border px-5 py-2">4 Sao</button>
          <button className="border px-5 py-2">Có Bình Luận</button>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-8">
        {reviews.map((r: any) => (
          <div key={r.id} className="border-b pb-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1">
                <p className="font-medium">{r.User?.full_name || "Người dùng"}</p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${
                        i <= r.rating ? "fill-[#ee4d2d] text-[#ee4d2d]" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#757575] mt-2">
                  {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <p className="mt-4 leading-7">{r.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showReviewForm && userId && (
        <ReviewForm
          productId={productId}
          userId={userId}
          onCancel={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};