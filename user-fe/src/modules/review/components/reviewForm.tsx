import { useState } from "react";
import { Star, X, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { useCreateReview } from "../api/create-review";

interface ReviewFormProps {
  productId: number;
  userId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  userId,
  onCancel,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const createMutation = useCreateReview();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} không phải là ảnh`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} vượt quá 5MB`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
        images: images.length > 0 ? images : undefined,
      });

      toast.success("Đánh giá đã được gửi");
      onSuccess();
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể gửi đánh giá");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Đánh giá sản phẩm</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="size-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Rating */}
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

          {/* Comment */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Nhận xét</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Hình ảnh (tối đa 5 ảnh, mỗi ảnh tối đa 5MB)</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-500" />
                  <span className="text-sm text-slate-600">Chọn ảnh</span>
                </label>
                <span className="text-sm text-slate-500">{images.length}/5</span>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
