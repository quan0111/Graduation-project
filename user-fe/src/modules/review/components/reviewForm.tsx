import { useState } from "react";
import { ImagePlus, Loader2, PlayCircle, Star, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateReview } from "../api/create-review";

interface ReviewFormProps {
  productId: number;
  userId: number;
  orderId?: number;
  orderItemId?: number;
  productName?: string | null;
  productImage?: string | null;
  variantName?: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

type MediaPreview = {
  url: string;
  type: "image" | "video";
};

const MAX_MEDIA = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_COMMENT_LENGTH = 800;

const ratingCopy: Record<number, { label: string; hint: string }> = {
  1: { label: "Rất tệ", hint: "Sản phẩm hoặc trải nghiệm không đạt kỳ vọng" },
  2: { label: "Chưa tốt", hint: "Có vấn đề cần shop cải thiện" },
  3: { label: "Tạm ổn", hint: "Đúng cơ bản nhưng chưa thật sự nổi bật" },
  4: { label: "Hài lòng", hint: "Trải nghiệm tốt, chỉ còn vài điểm nhỏ" },
  5: { label: "Xuất sắc", hint: "Sản phẩm đúng ý và đáng mua lại" },
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  userId,
  orderId,
  orderItemId,
  productName,
  productImage,
  variantName,
  onCancel,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);

  const createMutation = useCreateReview();
  const activeRating = hoverRating || rating;
  const activeCopy = ratingCopy[activeRating];
  const inputId = `review-media-upload-${productId}`;

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (mediaFiles.length + files.length > MAX_MEDIA) {
      toast.error(`Tối đa ${MAX_MEDIA} ảnh hoặc video`);
      event.target.value = "";
      return;
    }

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} không phải ảnh hoặc video`);
        return false;
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(isVideo ? `Video ${file.name} vượt quá 50MB` : `Ảnh ${file.name} vượt quá 5MB`);
        return false;
      }

      return true;
    });

    setMediaFiles((current) => [...current, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((current) => [
          ...current,
          {
            url: reader.result as string,
            type: file.type.startsWith("video/") ? "video" : "image",
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    event.target.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      await createMutation.mutateAsync({
        userId,
        productId,
        orderId,
        orderItemId,
        rating,
        comment: comment.trim() || undefined,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      });

      toast.success("Đánh giá đã được gửi");
      onSuccess();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể gửi đánh giá");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ee4d2d]">Review sản phẩm</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Chia sẻ trải nghiệm của bạn</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Đóng form đánh giá"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-148px)] overflow-y-auto px-6 py-5">
          {(productName || productImage) ? (
            <div className="mb-5 flex gap-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
              <img
                src={productImage || "/placeholder.png"}
                alt={productName || "Sản phẩm"}
                className="size-16 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-slate-950">{productName || "Sản phẩm đã mua"}</p>
                {variantName ? <p className="mt-1 text-xs text-slate-500">{variantName}</p> : null}
              </div>
            </div>
          ) : null}

          <div className="space-y-6">
            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Bạn chấm sản phẩm mấy sao?</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeCopy ? `${activeCopy.label} - ${activeCopy.hint}` : "Chọn số sao phù hợp với trải nghiệm thực tế"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="rounded-full p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-300"
                      aria-label={`Chọn ${star} sao`}
                    >
                      <Star
                        className={`size-8 ${
                          activeRating >= star
                            ? "fill-[#f5b301] text-[#f5b301]"
                            : "fill-white text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-800">Nhận xét</label>
                <span className="text-xs text-slate-400">{comment.length}/{MAX_COMMENT_LENGTH}</span>
              </div>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Ví dụ: sản phẩm đóng gói chắc chắn, màu đúng ảnh, giao hàng nhanh..."
                rows={5}
                maxLength={MAX_COMMENT_LENGTH}
                className="min-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50/70 focus-visible:ring-orange-200"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-800">Ảnh/video thực tế</label>
                <span className="text-xs text-slate-400">{mediaFiles.length}/{MAX_MEDIA}</span>
              </div>

              <Input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
                id={inputId}
              />

              <label
                htmlFor={inputId}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-6 text-center transition hover:border-[#ee4d2d] hover:bg-orange-50"
              >
                <span className="flex size-11 items-center justify-center rounded-full bg-white text-[#ee4d2d] shadow-sm ring-1 ring-orange-100">
                  <ImagePlus className="size-5" />
                </span>
                <span className="mt-3 text-sm font-medium text-slate-900">Thêm ảnh hoặc video</span>
                <span className="mt-1 text-xs text-slate-500">Tối đa 5 tệp, ảnh 5MB, video 50MB</span>
              </label>

              {previews.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {previews.map((preview, index) => (
                    <div key={`${preview.url}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                      {preview.type === "video" ? (
                        <>
                          <video src={preview.url} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 text-white">
                            <PlayCircle className="size-7" />
                          </div>
                        </>
                      ) : (
                        <img src={preview.url} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute right-1.5 top-1.5 rounded-full bg-slate-950/75 p-1 text-white opacity-100 transition hover:bg-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="Xóa tệp đã chọn"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <Button onClick={onCancel} variant="outline" disabled={createMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-[#ee4d2d] hover:bg-[#d93f21]"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
