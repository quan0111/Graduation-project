import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { UploadedImage } from "../types/addproduct";

export function useMediaState(uploadImage: (data: { file: File; folder: string }) => Promise<{ url: string }>) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [images, setImages] = useState<UploadedImage[]>([]);

  const mediaErrors = useMemo(() => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Tên sản phẩm là bắt buộc.");
    if (!categoryId) errors.push("Bạn phải chọn ngành hàng.");
    if (images.length < 3) errors.push("Bạn cần ít nhất 3 hình ảnh.");
    return errors;
  }, [categoryId, images.length, name]);

  const handleUploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      try {
        const uploaded = await Promise.all(
          Array.from(files).map((file, index) =>
            uploadImage({ file, folder: "products" }).then((result) => ({
              url: result.url,
              position: images.length + index + 1,
              isPrimary: images.length === 0 && index === 0,
            })),
          ),
        );

        setImages((current) => {
          const next = [...current, ...uploaded];
          if (!next.some((image) => image.isPrimary) && next[0]) {
            next[0] = { ...next[0], isPrimary: true, position: 1 };
          }
          return next.map((image, index) => ({
            ...image,
            position: index + 1,
            isPrimary: index === 0 ? image.isPrimary || true : image.isPrimary,
          }));
        });

        toast.success("Đã tải hình ảnh sản phẩm");
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || "Không tải được hình ảnh");
      }
    },
    [images.length, uploadImage],
  );

  const setCoverImage = useCallback((index: number) => {
    setImages((current) => {
      const selected = current[index];
      const rest = current.filter((_, imageIndex) => imageIndex !== index);
      return [selected, ...rest].map((image, imageIndex) => ({
        ...image,
        position: imageIndex + 1,
        isPrimary: imageIndex === 0,
      }));
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((current) =>
      current
        .filter((_, imageIndex) => imageIndex !== index)
        .map((image, imageIndex) => ({
          ...image,
          position: imageIndex + 1,
          isPrimary: imageIndex === 0,
        })),
    );
  }, []);

  return {
    name,
    categoryId,
    images,
    mediaErrors,
    setName,
    setCategoryId,
    handleUploadFiles,
    setCoverImage,
    removeImage,
  };
}
