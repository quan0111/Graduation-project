'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { toast } from "sonner";
import { useGetAllSeller } from "@/modules/shop/api/seller/get-all-seller";
import { useApproveSeller } from "@/modules/shop/api/seller/approve";
import { useRejectSeller } from "@/modules/shop/api/seller/reject";

// ================= COLUMNS =================
const columns = (onApprove: any, onReject: any) => [
  {
    key: "shopName",
    label: "Tên Shop",
    render: (s: any) => (
      <div>
        <p className="font-medium">{s.shopName}</p>
        <p className="text-xs text-muted-foreground">{s.description}</p>
      </div>
    ),
  },
  {
    key: "user",
    label: "Người đăng ký",
    render: (s: any) => (
      <div>
        <p>{s.user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{s.user?.email}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Trạng thái",
    render: (s: any) => (
      <span
        className={`px-2 py-1 rounded text-xs ${
          s.status === "PENDING"
            ? "bg-yellow-100 text-yellow-700"
            : s.status === "APPROVED"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {s.status}
      </span>
    ),
  },
  {
    key: "actions",
    label: "Thao tác",
    render: (s: any) => (
      <div className="flex gap-2">
        {s.status === "PENDING" && (
          <>
            <Button size="sm" onClick={() => onApprove(s)}>
              Duyệt
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(s)}
            >
              Từ chối
            </Button>
          </>
        )}
      </div>
    ),
  },
];

export default function SellerApplicationsPage() {
  const [filter, setFilter] = useState("ALL");

  const { data = [], isLoading, isError } = useGetAllSeller();
  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();


  const handleApprove = (item: any) => {
    approveMutation.mutate(
      {
          id: item.id,
          admin_id: 0
      },
      {
        onSuccess: () => toast.success("Duyệt thành công"),
        onError: () => toast.error("Duyệt thất bại"),
      }
    );
  };

  const handleReject = (item: any) => {
    rejectMutation.mutate(
      {
          id: item.id,
          admin_id: 0
      },
      {
        onSuccess: () => toast.success("Từ chối thành công"),
        onError: () => toast.error("Từ chối thất bại"),
      }
    );
  };

  const filtered = data.filter((item: any) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  const tableColumns = columns(handleApprove, handleReject);

  if (isLoading) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Lỗi tải dữ liệu</div>;
  }

  return (
    <div className="p-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Duyệt Seller</h1>
        <p className="text-muted-foreground">
          Quản lý yêu cầu đăng ký bán hàng
        </p>
      </div>

      {/* FILTER */}
      <div className="flex gap-2 mb-4">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <Button
            key={s}
            variant={filter === s ? "default" : "outline"}
            onClick={() => setFilter(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      {/* TABLE */}
      <DataTable
        data={filtered}
        columns={tableColumns}
        title="Danh sách đăng ký seller"
      />
    </div>
  );
}