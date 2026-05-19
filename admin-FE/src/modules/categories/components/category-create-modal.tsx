'use client';

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateCategory } from "../api/add-category";
import { useGetCategories } from "../api/category";
import type { ICategory } from "../types";
import { toast } from "sonner"; // 👈 thêm

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CategoryCreateModal({ open, onClose }: Props) {
  const { register, handleSubmit, reset } = useForm<ICategory>();

  const { data: categories = [] } = useGetCategories();

  const createCategoryMutation = useCreateCategory({
    config: {
      onSuccess: () => {
        toast.success("Tạo danh mục thành công 🎉"); // 👈 thông báo

        reset();        // reset form
        onClose();      // đóng modal
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || "Tạo danh mục thất bại ");
      },
    },
  });

  const onSubmit = (data: ICategory) => {
    if (!data.slug?.trim()) {
      toast.error("Slug là bắt buộc");
      return;
    }
    createCategoryMutation.mutate({
      ...data,
      slug: data.slug.trim(),
      parentId: data.parentId ? Number(data.parentId) : null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          reset(); // 👈 đóng bằng click ngoài cũng reset
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Thêm danh mục</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Input
            placeholder="Tên danh mục"
            {...register("name", { required: true })}
          />

          <Input
            placeholder="Slug"
            {...register("slug", { required: true })}
          />

          <select
            className="w-full border rounded-md px-3 py-2"
            {...register("parentId")}
          >
            <option value="">-- Không có danh mục cha --</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <Button
            type="submit"
            className="w-full"
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending
              ? "Đang tạo..."
              : "Tạo danh mục"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
