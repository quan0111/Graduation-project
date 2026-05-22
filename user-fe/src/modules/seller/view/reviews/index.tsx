import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { API_URL_REVIEW } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { useReplyReview } from "@/modules/review/api/reply-review";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

type ReviewMedia = {
  id?: number;
  url: string;
  type?: string;
};

type ReviewReply = {
  id: number;
  content: string;
  createdAt?: string;
  sellerId?: number;
};

type SellerReview = {
  id: number;
  rating: number;
  comment?: string | null;
  createdAt?: string;
  productId?: number;
  productName: string;
  user?: {
    fullName?: string | null;
    email?: string | null;
  };
  media?: ReviewMedia[];
  replies?: ReviewReply[];
};

const TEXT = {
  title: "Phản hồi review của khách",
  eyebrow: "Đánh giá",
  description: "Seller chỉ thấy review thuộc sản phẩm của shop và phản hồi bằng API review reply.",
  total: "Tổng",
  pending: "Chờ phản hồi",
  answered: "Đã phản hồi",
  loading: "Đang tải đánh giá...",
  loadFailed: "Không thể tải danh sách đánh giá.",
  empty: "Chưa có review nào cho sản phẩm của shop.",
  unknownTime: "Không rõ thời gian",
  customer: "Khách hàng",
  replyTitle: "Phản hồi của shop",
  replyPlaceholder: "Nhập phản hồi của shop...",
  submit: "Gửi phản hồi",
  submitting: "Đang gửi...",
  required: "Vui lòng nhập nội dung phản hồi",
  success: "Đã phản hồi đánh giá",
  failed: "Không thể phản hồi đánh giá",
};

const isVideo = (url: string) => /\.(mp4|mov|webm)(\?|$)/i.test(url);

const fetchSellerReviews = async (): Promise<SellerReview[]> => {
  const response = await apiClient.get(`${API_URL_REVIEW}/seller`);
  return (response.data as any[])
    .map((review) => ({
      ...review,
      productId: review.productId ?? review.product_id,
      productName: review.product?.name ?? review.Product?.name ?? `Product #${review.productId ?? review.product_id}`,
      user: review.user ?? review.User,
      media: review.media ?? [],
      replies: review.replies ?? [],
    }))
    .sort((a, b) => {
      const left = new Date(a.createdAt ?? 0).getTime();
      const right = new Date(b.createdAt ?? 0).getTime();
      return right - left;
    });
};

export default function SellerReviewsPage() {
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const replyMutation = useReplyReview();
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["seller", "reviews"],
    queryFn: fetchSellerReviews,
  });

  const answeredCount = reviews.filter((review) => (review.replies?.length ?? 0) > 0).length;
  const pendingCount = Math.max(reviews.length - answeredCount, 0);

  const handleReply = async (review: SellerReview) => {
    const content = drafts[review.id]?.trim();
    if (!content) {
      toast.error(TEXT.required);
      return;
    }

    try {
      await replyMutation.mutateAsync({ reviewId: review.id, content });
      setDrafts((current) => ({ ...current, [review.id]: "" }));
      toast.success(TEXT.success);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : TEXT.failed);
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ee4d2d]">{TEXT.eyebrow}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">{TEXT.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{TEXT.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Metric label={TEXT.total} value={reviews.length} />
              <Metric label={TEXT.pending} value={pendingCount} />
              <Metric label={TEXT.answered} value={answeredCount} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-4xl bg-white p-8 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
            {TEXT.loading}
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-4xl bg-white p-8 text-sm text-rose-500 shadow-sm ring-1 ring-slate-200/80">
            {TEXT.loadFailed}
          </div>
        ) : null}

        {!isLoading && !isError && reviews.length === 0 ? <EmptyMessage text={TEXT.empty} /> : null}

        <div className="space-y-4">
          {reviews.map((review) => {
            const hasReply = (review.replies?.length ?? 0) > 0;

            return (
              <article key={review.id} className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{review.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {review.user?.fullName || review.user?.email || TEXT.customer} ·{" "}
                      {review.createdAt ? new Date(review.createdAt).toLocaleString("vi-VN") : TEXT.unknownTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                    <Star className="size-4 fill-current" />
                    {review.rating}/5
                  </div>
                </div>

                {review.comment ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{review.comment}</p> : null}

                {review.media?.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {review.media.map((item, index) =>
                      isVideo(item.url) || item.type === "VIDEO" ? (
                        <video key={item.id ?? item.url} src={item.url} controls className="h-24 w-32 rounded-xl object-cover" />
                      ) : (
                        <img
                          key={item.id ?? `${item.url}-${index}`}
                          src={item.url}
                          alt="Review media"
                          className="h-24 w-24 rounded-xl object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ),
                    )}
                  </div>
                ) : null}

                {hasReply ? (
                  <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-700">
                      <MessageSquare className="size-4" />
                      {TEXT.replyTitle}
                    </p>
                    <div className="space-y-3">
                      {review.replies?.map((reply) => (
                        <div key={reply.id}>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{reply.content}</p>
                          {reply.createdAt ? (
                            <p className="mt-1 text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString("vi-VN")}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 space-y-3">
                    <Textarea
                      value={drafts[review.id] ?? ""}
                      onChange={(event) => setDrafts((current) => ({ ...current, [review.id]: event.target.value }))}
                      rows={3}
                      placeholder={TEXT.replyPlaceholder}
                    />
                    <Button
                      className="bg-[#ee4d2d] hover:bg-[#d93f21]"
                      onClick={() => handleReply(review)}
                      disabled={replyMutation.isPending}
                    >
                      <MessageSquare className="size-4" />
                      {replyMutation.isPending ? TEXT.submitting : TEXT.submit}
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </SellerDashboardLayout>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-orange-50 px-4 py-3">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="rounded-4xl bg-white p-8 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/80">
      {text}
    </div>
  );
}
