import { memo } from "react";

import type { UploadedImage, VariantDraft } from "../../types/addproduct";
import { VariantRow } from "./variantRow";

type Props = {
  variants: VariantDraft[];
  images: UploadedImage[];
  isUploadingVariantImage?: boolean;
  updateVariant: (index: number, field: keyof VariantDraft, value: string | number) => void;
  uploadVariantImage: (index: number, file: File) => Promise<void>;
};

export const VariantTable = memo(function VariantTable({
  variants,
  images,
  isUploadingVariantImage = false,
  updateVariant,
  uploadVariantImage,
}: Props) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Phân loại</th>
              <th className="px-4 py-3 font-medium">Ảnh</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Tồn kho</th>
              <th className="px-4 py-3 font-medium">Cân nặng (kg)</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <VariantRow
                key={variant.key}
                variant={variant}
                index={index}
                images={images}
                isUploadingImage={isUploadingVariantImage}
                updateVariant={updateVariant}
                uploadVariantImage={uploadVariantImage}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
