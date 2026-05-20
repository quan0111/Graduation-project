import { ImagePlus, Loader2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { memo } from "react";

import { Input } from "@/components/ui/input";

import type { UploadedImage, VariantDraft } from "../../types/addproduct";

type Props = {
  variant: VariantDraft;
  index: number;
  images: UploadedImage[];
  isUploadingImage?: boolean;
  updateVariant: (index: number, field: keyof VariantDraft, value: string | number) => void;
  uploadVariantImage: (index: number, file: File) => Promise<void>;
};

export const VariantRow = memo(function VariantRow({
  variant,
  index,
  images,
  isUploadingImage = false,
  updateVariant,
  uploadVariantImage,
}: Props) {
  const inputId = `variant-image-${index}-${variant.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await uploadVariantImage(index, file);
  };

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900">{variant.name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {Object.entries(variant.optionMap)
            .map(([key, value]) => `${key}: ${value}`)
            .join(" | ")}
        </p>
      </td>

      <td className="px-4 py-3">
        <div className="flex min-w-72 items-center gap-3">
          <div className="size-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {variant.imageUrl ? (
              <img src={variant.imageUrl} alt={variant.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Ảnh</div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <select
              value={variant.imageUrl}
              onChange={(event) => updateVariant(index, "imageUrl", event.target.value)}
              className="h-10 w-full rounded-3xl border border-input bg-input/30 px-3 text-sm outline-none"
            >
              <option value="">Chọn ảnh sản phẩm</option>
              {images.map((image) => (
                <option key={image.url} value={image.url}>
                  Ảnh sản phẩm {image.position}
                </option>
              ))}
            </select>

            <div>
              <input
                id={inputId}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleUpload}
                disabled={isUploadingImage}
              />
              <label
                htmlFor={inputId}
                className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-orange-200 px-3 text-xs font-medium text-orange-600 transition hover:bg-orange-50 ${
                  isUploadingImage ? "pointer-events-none opacity-60" : ""
                }`}
              >
                {isUploadingImage ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                Upload ảnh phân loại
              </label>
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <Input
          value={variant.sku}
          onChange={(event) => updateVariant(index, "sku", event.target.value)}
          placeholder="SKU tự sinh hoặc tự nhập"
        />
      </td>

      <td className="px-4 py-3">
        <Input
          type="number"
          value={variant.price}
          onChange={(event) => updateVariant(index, "price", Number(event.target.value))}
          placeholder="0"
        />
      </td>

      <td className="px-4 py-3">
        <Input
          type="number"
          value={variant.stock}
          onChange={(event) => updateVariant(index, "stock", Number(event.target.value))}
          placeholder="0"
        />
      </td>

      <td className="px-4 py-3">
        <Input
          type="number"
          value={variant.weight}
          onChange={(event) => updateVariant(index, "weight", Number(event.target.value))}
          placeholder="0.5"
        />
      </td>
    </tr>
  );
});
