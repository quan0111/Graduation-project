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
    label: "Ten Shop",
    render: (seller: any) => (
      <div>
        <p className="font-medium">{seller.shopName}</p>
        <p className="text-xs text-muted-foreground">{seller.description}</p>
      </div>
    ),
  },
  {
    key: "user",
    label: "Nguoi dang ky",
    render: (seller: any) => (
      <div>
        <p>{seller.user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{seller.user?.email}</p>
      </div>
    ),
  },
  {
    key: "status",
    label: "Trang thai",
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
    label: "Thao tac",
    render: (seller: any) => (
      <div className="flex gap-2">
        {seller.status === "PENDING" && (
          <>
            <Button size="sm" onClick={() => onApprove(seller)}>
              Duyet
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onReject(seller)}>
              Tu choi
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
      { id: item.id },
      {
        onSuccess: () => toast.success("Duyet thanh cong"),
        onError: () => toast.error("Duyet that bai"),
      },
    );
  };

  const handleReject = (item: any) => {
    rejectMutation.mutate(
      { id: item.id },
      {
        onSuccess: () => toast.success("Tu choi thanh cong"),
        onError: () => toast.error("Tu choi that bai"),
      },
    );
  };

  const filtered = data.filter((item: any) => {
    if (filter === "ALL") return true;
    return item.status === filter;
  });

  if (isLoading) {
    return <div className="p-6">Dang tai...</div>;
  }

  if (isError) {
    return <div className="p-6 text-red-500">Loi tai du lieu</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Duyet Seller</h1>
        <p className="text-muted-foreground">Quan ly yeu cau dang ky ban hang</p>
      </div>

      <div className="mb-4 flex gap-2">
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            onClick={() => setFilter(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      <DataTable
        data={filtered}
        columns={columns(handleApprove, handleReject)}
        title="Danh sach dang ky seller"
      />
    </div>
  );
}
