import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUploadImage } from "@/modules/upload/api/upload-image";

import type { BannerCreatePayload, BannerPosition, BannerStatus } from "../types";
import { getApiErrorMessage } from "../utils/error";

type BannerFormState = {
  title: string;
  subtitle: string;
  redirectUrl: string;
  buttonText: string;
  position: BannerPosition;
  status: BannerStatus;
  priority: string;
  startAt: string;
  endAt: string;
};

type SelectedBannerImage = {
  file: File;
  previewUrl: string;
};

type Props = {
  open: boolean;
  pending?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: BannerCreatePayload) => Promise<void>;
};

const BANNER_UPLOAD_FOLDER = "datn/banners";
const MAX_BANNER_IMAGE_SIZE = 5 * 1024 * 1024;

const COPY = {
  title: "Tạo banner",
  description: "Tải ảnh banner từ máy và cấu hình vị trí hiển thị trên storefront.",
  name: "Tên banner",
  subtitle: "Mô tả",
  desktopImage: "Ảnh desktop",
  mobileImage: "Ảnh mobile",
  desktopHint: "Khuyến nghị 1440x480px, PNG/JPG/WEBP, tối đa 5MB.",
  mobileHint: "Tùy chọn. Khuyến nghị 720x720px để hiển thị tốt trên điện thoại.",
  chooseImage: "Chọn ảnh từ máy",
  changeImage: "Đổi ảnh",
  removeImage: "Gỡ ảnh",
  redirectUrl: "URL điều hướng",
  buttonText: "Nút CTA",
  position: "Vị trí",
  status: "Trạng thái",
  priority: "Độ ưu tiên",
  startAt: "Bắt đầu",
  endAt: "Kết thúc",
  cancel: "Hủy",
  submit: "Tạo banner",
  uploading: "Đang tải ảnh...",
  submitting: "Đang tạo...",
  required: "Tên banner và ảnh desktop là bắt buộc.",
  invalidImage: "Chỉ hỗ trợ file ảnh.",
  invalidSize: "Ảnh banner không được vượt quá 5MB.",
  invalidPriority: "Độ ưu tiên phải là số nguyên không âm.",
  invalidDate: "Thời gian kết thúc phải sau thời gian bắt đầu.",
  uploadMissingUrl: "Upload ảnh thành công nhưng backend không trả về URL ảnh.",
  failed: "Tạo banner thất bại.",
};

const INITIAL_FORM: BannerFormState = {
  title: "",
  subtitle: "",
  redirectUrl: "",
  buttonText: "",
  position: "HOME_TOP",
  status: "ACTIVE",
  priority: "0",
  startAt: "",
  endAt: "",
};

const POSITION_OPTIONS: Array<{ value: BannerPosition; label: string }> = [
  { value: "HOME_TOP", label: "Đầu trang chủ" },
  { value: "HOME_MIDDLE", label: "Giữa trang chủ" },
  { value: "HOME_BOTTOM", label: "Cuối trang chủ" },
  { value: "CATEGORY_TOP", label: "Đầu trang danh mục" },
  { value: "PRODUCT_DETAIL", label: "Chi tiết sản phẩm" },
];

const STATUS_OPTIONS: Array<{ value: BannerStatus; label: string }> = [
  { value: "DRAFT", label: "Bản nháp" },
  { value: "ACTIVE", label: "Đang bật" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "ENDED", label: "Đã kết thúc" },
];

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const optionalValue = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toOptionalDate = (value: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function BannerCreateDialog({ open, pending = false, onOpenChange, onSubmit }: Props) {
  const [form, setForm] = useState<BannerFormState>(INITIAL_FORM);
  const [desktopImage, setDesktopImage] = useState<SelectedBannerImage | null>(null);
  const [mobileImage, setMobileImage] = useState<SelectedBannerImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync: uploadImage, isPending: isUploadingImage } = useUploadImage();
  const isBusy = pending || isUploadingImage;

  useEffect(() => {
    if (open) {
      setForm({ ...INITIAL_FORM });
      setDesktopImage(null);
      setMobileImage(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (desktopImage?.previewUrl) {
        URL.revokeObjectURL(desktopImage.previewUrl);
      }
    };
  }, [desktopImage?.previewUrl]);

  useEffect(() => {
    return () => {
      if (mobileImage?.previewUrl) {
        URL.revokeObjectURL(mobileImage.previewUrl);
      }
    };
  }, [mobileImage?.previewUrl]);

  const updateField = (field: keyof BannerFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateImage = (target: "desktop" | "mobile", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(COPY.invalidImage);
      return;
    }

    if (file.size > MAX_BANNER_IMAGE_SIZE) {
      setError(COPY.invalidSize);
      return;
    }

    const nextImage = {
      file,
      previewUrl: URL.createObjectURL(file),
    };

    setError(null);
    if (target === "desktop") {
      setDesktopImage(nextImage);
      return;
    }

    setMobileImage(nextImage);
  };

  const removeImage = (target: "desktop" | "mobile") => {
    if (target === "desktop") {
      setDesktopImage(null);
      return;
    }

    setMobileImage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const title = form.title.trim();

    if (!title || !desktopImage) {
      setError(COPY.required);
      return;
    }

    const priority = Number(form.priority || 0);
    if (!Number.isInteger(priority) || priority < 0) {
      setError(COPY.invalidPriority);
      return;
    }

    const startDate = toOptionalDate(form.startAt);
    const endDate = toOptionalDate(form.endAt);
    if (startDate && endDate && endDate <= startDate) {
      setError(COPY.invalidDate);
      return;
    }

    try {
      const desktopUpload = await uploadImage({
        file: desktopImage.file,
        folder: BANNER_UPLOAD_FOLDER,
      });
      const mobileUpload = mobileImage
        ? await uploadImage({
            file: mobileImage.file,
            folder: BANNER_UPLOAD_FOLDER,
          })
        : null;

      if (!desktopUpload.url || (mobileImage && !mobileUpload?.url)) {
        setError(COPY.uploadMissingUrl);
        return;
      }

      await onSubmit({
        title,
        subtitle: optionalValue(form.subtitle),
        imageUrl: desktopUpload.url,
        mobileImageUrl: mobileUpload?.url ?? null,
        redirectUrl: optionalValue(form.redirectUrl),
        buttonText: optionalValue(form.buttonText),
        position: form.position,
        status: form.status,
        priority,
        startAt: startDate?.toISOString() ?? null,
        endAt: endDate?.toISOString() ?? null,
      });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, COPY.failed));
    }
  };

  const submitLabel = isUploadingImage ? COPY.uploading : pending ? COPY.submitting : COPY.submit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{COPY.title}</DialogTitle>
          <DialogDescription>{COPY.description}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="banner-title">{COPY.name}</Label>
            <Input
              id="banner-title"
              value={form.title}
              onChange={(event) => updateField("title", event.currentTarget.value)}
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <BannerImageInput
              id="banner-desktop-image"
              label={COPY.desktopImage}
              hint={COPY.desktopHint}
              image={desktopImage}
              required
              disabled={isBusy}
              onChange={(event) => updateImage("desktop", event)}
              onRemove={() => removeImage("desktop")}
            />
            <BannerImageInput
              id="banner-mobile-image"
              label={COPY.mobileImage}
              hint={COPY.mobileHint}
              image={mobileImage}
              disabled={isBusy}
              onChange={(event) => updateImage("mobile", event)}
              onRemove={() => removeImage("mobile")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-subtitle">{COPY.subtitle}</Label>
            <Textarea
              id="banner-subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.currentTarget.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-redirect">{COPY.redirectUrl}</Label>
              <Input
                id="banner-redirect"
                value={form.redirectUrl}
                onChange={(event) => updateField("redirectUrl", event.currentTarget.value)}
                placeholder="/flash-sale hoặc /flash-sale?campaign=1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-button">{COPY.buttonText}</Label>
              <Input
                id="banner-button"
                value={form.buttonText}
                onChange={(event) => updateField("buttonText", event.currentTarget.value)}
                placeholder="Mua ngay"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="banner-position">{COPY.position}</Label>
              <select
                id="banner-position"
                className={selectClassName}
                value={form.position}
                onChange={(event) => updateField("position", event.currentTarget.value as BannerPosition)}
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-status">{COPY.status}</Label>
              <select
                id="banner-status"
                className={selectClassName}
                value={form.status}
                onChange={(event) => updateField("status", event.currentTarget.value as BannerStatus)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-priority">{COPY.priority}</Label>
              <Input
                id="banner-priority"
                min={0}
                step={1}
                type="number"
                value={form.priority}
                onChange={(event) => updateField("priority", event.currentTarget.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-start">{COPY.startAt}</Label>
              <Input
                id="banner-start"
                type="datetime-local"
                value={form.startAt}
                onChange={(event) => updateField("startAt", event.currentTarget.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-end">{COPY.endAt}</Label>
              <Input
                id="banner-end"
                type="datetime-local"
                value={form.endAt}
                onChange={(event) => updateField("endAt", event.currentTarget.value)}
              />
            </div>
          </div>

          {error && <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">{error}</div>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              {COPY.cancel}
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type BannerImageInputProps = {
  id: string;
  label: string;
  hint: string;
  image: SelectedBannerImage | null;
  required?: boolean;
  disabled?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

function BannerImageInput({
  id,
  label,
  hint,
  image,
  required = false,
  disabled = false,
  onChange,
  onRemove,
}: BannerImageInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        <span className="text-xs text-muted-foreground">{image ? COPY.changeImage : COPY.chooseImage}</span>
      </div>
      <label
        htmlFor={id}
        className={`flex min-h-44 cursor-pointer flex-col overflow-hidden rounded-lg border border-dashed bg-muted/20 text-sm transition hover:border-primary/60 hover:bg-muted/40 ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        {image ? (
          <img src={image.previewUrl} alt={label} className="h-32 w-full object-cover" />
        ) : (
          <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
            <ImagePlus className="mb-2 size-7" />
            <span>{COPY.chooseImage}</span>
          </div>
        )}
        <div className="border-t bg-background px-3 py-2 text-xs text-muted-foreground">{hint}</div>
        <input id={id} type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onChange} />
      </label>
      {image && (
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs">
          <span className="truncate text-muted-foreground">{image.file.name}</span>
          <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={onRemove} disabled={disabled}>
            <X className="mr-1 size-3.5" />
            {COPY.removeImage}
          </Button>
        </div>
      )}
    </div>
  );
}
