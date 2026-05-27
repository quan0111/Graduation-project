import { useMemo, useState } from "react";
import { CheckCircle2, MessageSquare, PlayCircle, Star } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/date";
import { ReviewForm } from "@/modules/review/components/reviewForm";
import { useReviewsByProduct } from "@/modules/review/api/get-review";

type ReviewFilter = "all" | "5" | "4" | "comment" | "media";

type ReviewMedia = {
  url: string;
  type: "image" | "video";
};

const filterOptions: Array<{ value: ReviewFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "5", label: "5 sao" },
  { value: "4", label: "4 sao" },
  { value: "comment", label: "Có bình luận" },
  { value: "media", label: "Có ảnh/video" },
];

const RatingStars = ({ value, size = 18 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const fillPercent = Math.max(0, Math.min(1, value - (star - 1))) * 100;

      return (
        <span key={star} className="relative inline-flex" style={{ width: size, height: size }}>
          <Star size={size} className="absolute left-0 top-0 fill-slate-100 text-slate-300" />
          <span className="absolute left-0 top-0 overflow-hidden" style={{ width: `${fillPercent}%` }}>
            <Star size={size} className="fill-[#f5b301] text-[#f5b301]" />
          </span>
        </span>
      );
    })}
  </div>
);

const getReviewMedia = (review: any): ReviewMedia[] => {
  const rawMedia = review.media ?? review.mediaUrls ?? review.media_urls ?? review.images ?? [];
  if (!Array.isArray(rawMedia)) return [];

  return rawMedia
    .map((item: any) => {
      const url = typeof item === "string" ? item : item?.url ?? item?.mediaUrl ?? item?.media_url;
      if (!url) return null;
      const declaredType = typeof item === "object" ? item?.type ?? item?.mediaType ?? item?.media_type : "";
      const isVideo = String(declaredType).startsWith("video") || /\.(mp4|webm|ogg)$/i.test(String(url));
      return { url: String(url), type: isVideo ? "video" : "image" } satisfies ReviewMedia;
    })
    .filter(Boolean) as ReviewMedia[];
};

const getUserName = (review: any) => {
  const user = review.user || review.User;
  return user?.fullName || user?.full_name || user?.email || "Người dùng";
};

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

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
    if (!reviews.length) return 0;
    return reviews.reduce((sum: number, review: any) => sum + Number(review.rating || 0), 0) / reviews.length;
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    return reviews.reduce(
      (counts: Record<number, number>, review: any) => {
        const value = Math.round(Number(review.rating || 0));
        if (value >= 1 && value <= 5) counts[value] += 1;
        return counts;
      },
      { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    );
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review: any) => {
      if (filter === "5") return Number(review.rating) === 5;
      if (filter === "4") return Number(review.rating) === 4;
      if (filter === "comment") return Boolean(review.comment?.trim());
      if (filter === "media") return getReviewMedia(review).length > 0;
      return true;
    });
  }, [filter, reviews]);

  const handleReviewSuccess = async () => {
    setShowReviewForm(false);
    await queryClient.invalidateQueries({ queryKey: ["reviews", "product", productId] });
    await queryClient.invalidateQueries({ queryKey: ["reviews", "stats", productId] });
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        Đang tải đánh giá...
      </div>
    );
  }

  const reviewButton = userId ? (
    <Button onClick={() => setShowReviewForm(true)} variant="outline" className="border-orange-200 text-[#ee4d2d] hover:bg-orange-50">
      <MessageSquare className="size-4" />
      Viết đánh giá
    </Button>
  ) : null;

  if (!reviews.length) {
    return (
      <div>
        <div className="mb-4 flex justify-end">{reviewButton}</div>
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-orange-100 text-[#ee4d2d]">
            <Star className="size-7" />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-950">Chưa có đánh giá</p>
          <p className="mt-2 text-sm text-slate-500">Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này.</p>
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
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">{reviewButton}</div>

      <div className="mb-8 rounded-3xl border border-orange-100 bg-orange-50/70 p-5">
        <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-orange-100">
            <p className="text-4xl font-bold text-[#ee4d2d]">{rating.toFixed(1)}</p>
            <p className="mt-1 text-sm text-slate-500">trên 5 điểm</p>
            <div className="mt-3 flex justify-center">
              <RatingStars value={rating} size={20} />
            </div>
            <p className="mt-3 text-xs text-slate-500">{reviews.length} đánh giá</p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star] ?? 0;
              const percent = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} className="grid grid-cols-[56px_minmax(0,1fr)_44px] items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-slate-700">
                    {star}
                    <Star className="size-3.5 fill-[#f5b301] text-[#f5b301]" />
                  </span>
                  <div className="h-2 overflow-hidden rounded-full bg-white ring-1 ring-orange-100">
                    <div className="h-full rounded-full bg-[#ee4d2d]" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-right text-xs text-slate-500">{count}</span>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-2 pt-2">
              {filterOptions.map((option) => {
                const active = filter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={
                      active
                        ? "rounded-full bg-[#ee4d2d] px-4 py-2 text-sm font-medium text-white shadow-sm"
                        : "rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:text-[#ee4d2d] hover:ring-orange-200"
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            Không có đánh giá phù hợp
          </div>
        ) : (
          filteredReviews.map((review: any) => {
            const userName = getUserName(review);
            const createdAt = review.createdAt || review.created_at;
            const media = getReviewMedia(review);
            const verified = Boolean(review.isVerifiedPurchase ?? review.is_verified_purchase);

            return (
              <article key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {getInitials(userName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">{userName}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <RatingStars value={Number(review.rating || 0)} size={15} />
                          {verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
                              <CheckCircle2 className="size-3" />
                              Đã mua hàng
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {createdAt ? <p className="text-xs text-slate-500">{formatDateTime(createdAt)}</p> : null}
                    </div>

                    {review.comment ? (
                      <p className="mt-4 whitespace-pre-wrap wrap-break-word text-sm leading-7 text-slate-700">{review.comment}</p>
                    ) : null}

                    {media.length ? (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {media.map((item, index) => (
                          <div key={`${item.url}-${index}`} className="relative size-20 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                            {item.type === "video" ? (
                              <>
                                <video src={item.url} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white">
                                  <PlayCircle className="size-5" />
                                </div>
                              </>
                            ) : (
                              <img src={item.url} alt={`Ảnh đánh giá ${index + 1}`} className="h-full w-full object-cover" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
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
