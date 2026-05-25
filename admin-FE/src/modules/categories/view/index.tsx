'use client';

import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/common/data-table";
import { CategoryFilter } from "../components/category-filter";
import { CategoryStats } from "../components/category-stats";
import { categoryColumns } from "../components/categories-collumn";
import { type Category, useGetCategories } from "../api/category";
import { useDeleteCategory } from "../api/delete-category";
import { useUpdateCategory } from "../api/update-category";
import { CategoryCreateModal } from "../components/category-create-modal";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/app-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false); // 👈 modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading, isError } = useGetCategories();
  const updateCategoryMutation = useUpdateCategory({
    onSuccess: () => {
      toast.success("Cập nhật danh mục thành công");
      setEditingCategory(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Cập nhật danh mục thất bại");
    },
  });
  const deleteCategoryMutation = useDeleteCategory({
    config: {
      onSuccess: () => {
        toast.success("Đã xóa danh mục");
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.detail || "Xóa danh mục thất bại");
      },
    },
  });

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (c: any) => {
    setEditingCategory(c);
    setEditName(c.name || "");
    setEditSlug(c.slug || "");
    setEditParentId(c.parentId ? String(c.parentId) : "");
  };

  const handleDelete = (c: any) => {
    setDeleteTarget(c);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategoryMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    if (!editName.trim()) {
      toast.error("Tên danh mục không được trống");
      return;
    }

    await updateCategoryMutation.mutateAsync({
      id: String(editingCategory.id),
      data: {
        name: editName.trim(),
        slug: editSlug.trim() || null,
        parentId: editParentId ? Number(editParentId) : null,
      },
    });
  };

  const columns = categoryColumns(handleEdit, handleDelete);

  if (isLoading) {
    return <div className="p-6">Đang tải danh mục...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Lỗi khi tải danh mục</div>;
  }

  return (
    <main className="flex-1 overflow-auto p-6 w-full">

      {/* HEADER + BUTTON */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Danh mục</h1>
          <p className="text-muted-foreground">
            Quản lý danh mục sản phẩm
          </p>
        </div>

        <Button onClick={() => setOpenCreate(true)}>
          + Thêm danh mục
        </Button>
      </div>

      <CategoryStats categories={categories} />

      <div className="flex justify-end mb-4">
        <CategoryFilter value={search} onChange={setSearch} />
      </div>

      <DataTable
        data={filtered as any}
        columns={columns}
        title="Danh sách danh mục"
      />

      <CategoryCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
      />

      <Dialog open={Boolean(editingCategory)} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Tên danh mục"
            />
            <Input
              value={editSlug}
              onChange={(event) => setEditSlug(event.target.value)}
              placeholder="Slug"
            />
            <select
              className="w-full rounded-md border px-3 py-2"
              value={editParentId}
              onChange={(event) => setEditParentId(event.target.value)}
            >
              <option value="">-- Không có danh mục cha --</option>
              {categories
                .filter((category) => category.id !== editingCategory?.id)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <Button
              className="w-full"
              onClick={handleSaveEdit}
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa danh mục"
        description={deleteTarget ? `Xóa danh mục "${deleteTarget.name}"?` : ""}
        confirmLabel="Xóa"
        variant="destructive"
        isPending={deleteCategoryMutation.isPending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
