import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useCreateReview } from "../api/create-review";

interface ReviewFormProps {
  productId: number;
  userId: number;
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

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  userId,
  onCancel,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<MediaPreview[]>([]);

  const createMutation = useCreateReview();

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (mediaFiles.length + files.length > MAX_MEDIA) {
      toast.error(`Tối đa ${MAX_MEDIA} ảnh hoặc video`);
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
        toast.error(
          isVideo
            ? `Video ${file.name} vượt quá 50MB`
            : `Ảnh ${file.name} vượt quá 5MB`,
        );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Đánh giá sản phẩm</h2>
          <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Đánh giá</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 ${
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nhận xét</label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Ảnh/video ({MAX_MEDIA} tệp, ảnh tối đa 5MB, video tối đa 50MB)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaUpload}
                  className="hidden"
                  id="review-media-upload"
                />
                <label
                  htmlFor="review-media-upload"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-2 transition-colors hover:border-slate-400 hover:bg-slate-50"
                >
                  <Upload className="size-5 text-slate-500" />
                  <span className="text-sm text-slate-600">Chọn tệp</span>
                </label>
                <span className="text-sm text-slate-500">{mediaFiles.length}/{MAX_MEDIA}</span>
              </div>

              {previews.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={`${preview.url}-${index}`} className="group relative">
                      {preview.type === "video" ? (
                        <video src={preview.url} className="h-24 w-full rounded-lg border border-slate-200 object-cover" />
                      ) : (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={onCancel} variant="outline">
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#ee4d2d] hover:bg-[#d93f21]"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
