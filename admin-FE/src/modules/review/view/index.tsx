'use client';

import { useState } from "react";
import { DataTable } from "@/components/common/data-table";
import { ConfirmDialog } from "@/components/common/app-dialog";
import { ReviewFilter } from "../components/search-filter-review";
import { reviewColumns } from "../components/review-collum";
import { useGetReview } from "../api/get-review";
import { useUpdateReview } from "../api/update-review";
import { toast } from "sonner";

const normalizeReviews = (value: any) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

export default function ReviewsPage() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);



  // ================= API =================
  const { data, isLoading, isError } = useGetReview({ });

  const reviews = normalizeReviews(data);



  const updateMutation = useUpdateReview();

  // ================= HANDLERS =================

  const handleDelete = (review: any) => {
    setDeleteTarget(review);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    updateMutation.mutate(
      { ...deleteTarget, deleteAt: new Date().toISOString() },
      {
        onSuccess: () => {
          toast.success("Xóa thành công");
          setDeleteTarget(null);
        },
        onError: () => toast.error("Xóa thất bại"),
      }
    );
  };

  const handleApprove = () => {
    toast.success("Đã duyệt review (demo)");
  };

  // ================= MAP DATA =================

  const mappedReviews = reviews.map((r: any) => ({
    id: r.id,
    productName: r.product?.name || "N/A",
    reviewer: r.user?.fullName || "N/A",
    rating: r.rating,
    title: r.title || "",
    content: r.comment || "",
    date: r.createdAt,
  }));

  // ================= FILTER =================

  const filtered = mappedReviews.filter((r: any) => {
    const matchSearch =
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.reviewer.toLowerCase().includes(search.toLowerCase());

    const matchRating =
      !ratingFilter || r.rating === ratingFilter;

    return matchSearch && matchRating;
  });

  const columns = reviewColumns(
    handleApprove,
    handleDelete
  );

  // ================= STATES =================

  if (isLoading) {
    return <div className="p-6">Đang tải review...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Lỗi tải review</div>;
  }

  // ================= UI =================

  return (
    <main className="flex-1 overflow-auto p-6 w-full">

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Quản lý Đánh giá
        </h1>
        <p className="text-muted-foreground">
          Quản lý toàn bộ đánh giá của khách hàng
        </p>
      </div>

      {/* //<ReviewStats {...({ data: stats } as any)} /> */}

      {/* 🔥 FILTER BAR */}
      <div className="mb-4 flex justify-between items-center">

        <ReviewFilter value={search} onChange={setSearch} />

        {/* ⭐ FILTER RATING */}
        <div className="flex gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() =>
                setRatingFilter(
                  ratingFilter === star ? null : star
                )
              }
              className={`px-2 py-1 border rounded ${
                ratingFilter === star
                  ? "bg-yellow-400 text-white"
                  : ""
              }`}
            >
              ⭐ {star}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <DataTable
        data={filtered}
        columns={columns}
        title="Danh sách đánh giá"
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa review"
        description="Xóa review này?"
        confirmLabel="Xóa"
        variant="destructive"
        isPending={updateMutation.isPending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </main>
  );
}
