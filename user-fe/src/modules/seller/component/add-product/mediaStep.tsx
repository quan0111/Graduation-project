import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Field } from "./field";
import { ValidationList } from "./validationList";
import type { Category, UploadedImage } from "../../types/addproduct";

type Props = {
  name: string;
  categoryId: number | "";
  images: UploadedImage[];
  categories: Category[];
  mediaErrors: string[];
  isUploading: boolean;
  onNameChange: (value: string) => void;
  onCategoryChange: (value: number | "") => void;
  onUploadFiles: (files: FileList | null) => void;
  onSetCoverImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
};

export function MediaStep({
  name,
  categoryId,
  images,
  categories,
  mediaErrors,
  isUploading,
  onNameChange,
  onCategoryChange,
  onUploadFiles,
  onSetCoverImage,
  onRemoveImage,
}: Props) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle>Hình ảnh, tên sản phẩm và ngành hàng</CardTitle>
        <CardDescription>
          Cần ít nhất 3 ảnh. Ảnh đầu tiên là ảnh bìa và được ưu tiên hiển thị ngoài trang chủ.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/60 p-6">
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-orange-200 bg-white px-6 py-10 text-center transition hover:bg-orange-50 ${
              isUploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <ImagePlus className="size-8 text-orange-500" />
            <p className="mt-4 font-medium text-slate-900">Tải ảnh sản phẩm</p>
            <p className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP. Tải nhiều file cùng lúc.</p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) => onUploadFiles(event.target.files)}
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.url}
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img src={image.url} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                    Ảnh bìa
                  </span>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="text-xs text-slate-500">Vị trí hiển thị: {index + 1}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() => onSetCoverImage(index)}
                  >
                    Đặt ảnh bìa
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onRemoveImage(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Tên sản phẩm">
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Ví dụ: Áo khoác bomber unisex"
            />
          </Field>

          <Field label="Ngành hàng">
            <select
              value={categoryId}
              onChange={(event) => onCategoryChange(event.target.value ? Number(event.target.value) : "")}
              className="h-10 w-full rounded-3xl border border-input bg-input/30 px-3 text-sm outline-none focus:border-ring focus:ring-[3px] focus:ring-ring/40"
            >
              <option value="">Chọn ngành hàng</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <ValidationList errors={mediaErrors} />
      </CardContent>
    </Card>
  );
}