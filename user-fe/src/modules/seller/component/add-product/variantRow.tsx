import { memo } from "react";

import { Input } from "@/components/ui/input";

import type { UploadedImage, VariantDraft } from "../../types/addproduct";

type Props = {
  variant: VariantDraft;
  index: number;
  images: UploadedImage[];
  updateVariant: (index: number, field: keyof VariantDraft, value: string | number) => void;
};

export const VariantRow = memo(function VariantRow({
  variant,
  index,
  images,
  updateVariant,
}: Props) {
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
        <select
          value={variant.imageUrl}
          onChange={(event) => updateVariant(index, "imageUrl", event.target.value)}
          className="h-10 min-w-44 rounded-3xl border border-input bg-input/30 px-3 text-sm outline-none"
        >
          <option value="">Chọn Ảnh</option>
          {images.map((image) => (
            <option key={image.url} value={image.url}>
              Ảnh {image.position}
            </option>
          ))}
        </select>
      </td>

      <td className="px-4 py-3">
        <Input
          value={variant.sku}
          onChange={(event) => updateVariant(index, "sku", event.target.value)}
          placeholder="SKU tu sinh hoac tu nhap"
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