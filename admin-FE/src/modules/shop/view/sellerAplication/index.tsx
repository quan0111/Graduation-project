'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { toast } from "sonner";
import { useGetAllSeller } from "@/modules/shop/api/seller/get-all-seller";
import { useApproveSeller } from "@/modules/shop/api/seller/approve";
import { useRejectSeller } from "@/modules/shop/api/seller/reject";

const columns = (onApprove: any, onReject: any) => [
  {
    key: "shopName",
    label: "Tên shop",
    render: (seller: any) => (
      <div>
        <p className="font-medium">{seller.shopName}</p>
        <p className="text-xs text-muted-foreground">{seller.description}</p>
      </div>
    ),
  },
  {
    key: "user",
    label: "Người đăng ký",
    render: (seller: any) => (
      <div>
        <p>{seller.user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{seller.user?.email}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    render: (seller: any) => (
      <span
        className={`rounded px-2 py-1 text-xs ${
          seller.status === "PENDING"
            ? "bg-yellow-100 text-yellow-700"
            : seller.status === "APPROVED"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {seller.status}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Thao tác",
    render: (seller: any) => (
      <div className="flex gap-2">
        {seller.status === "PENDING" && (
          <>
            <Button size="sm" onClick={() => onApprove(seller)}>
              Duyệt
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onReject(seller)}>
              Từ chối
            </Button>
          </>
        )}
      </div>
    ),
  },
];

const filterLabels: Record<string, string> = {
  ALL: "Tất cả",
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Đã từ chối",
};

export default function SellerApplicationsPage() {
  const [filter, setFilter] = useState("ALL");

  const { data = [], isLoading, isError } = useGetAllSeller();
  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();

  const handleApprove = (item: any) => {
    approveMutation.mutate(
      { id: item.id },
      {
        onSuccess: () => toast.success("Duyệt thành công"),
        onError: () => toast.error("Duyệt thất bại"),
      },
    );
  };

  const handleReject = (item: any) => {
    rejectMutation.mutate(
      { id: item.id },
      {
        onSuccess: () => toast.success("Từ chối thành công"),
        onError: () => toast.error("Từ chối thất bại"),
      },
    );
  };

  const filtered = data.filter((item: any) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Lỗi tải dữ liệu</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Duyệt người bán</h1>
        <p className="text-muted-foreground">Quản lý yêu cầu đăng ký bán hàng</p>
      </div>

      <div className="mb-4 flex gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {filterLabels[item]}
          </Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns(handleApprove, handleReject)}
        title="Danh sách đăng ký người bán"
      />
    </div>
  );
}
