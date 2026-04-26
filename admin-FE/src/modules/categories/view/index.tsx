'use client';

import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { CategoryFilter } from "../components/category-filter";
import { CategoryStats } from "../components/category-stats";
import { categoryColumns } from "../components/categories-collumn";
import { useGetCategories } from "../api/category";
import { CategoryCreateModal } from "../components/category-create-modal";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false); // 👈 modal state

  const { data: categories = [], isLoading, isError } = useGetCategories();

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.slug ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (c: any) => {
    console.log("edit", c.id);
  };

  const handleDelete = (c: any) => {
    console.log("delete", c.id);
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

      <CategoryStats />

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
    </main>
  );
}