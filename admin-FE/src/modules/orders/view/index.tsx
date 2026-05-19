'use client';

import { useState } from 'react';
import { DataTable } from "@/components/common/data-table";
import { orderColumns } from "../components/order-collums";
import { OrderStats } from "../components/order-stats";
import { OrderFilter } from "../components/search-filter-order";
import { OrderDetailModal } from "../components/order-detail-modal";
import { useGetAllOrders } from "../api/get-all-orders";
import { useUpdateOrder } from "../api/update-order";
import { toast } from "sonner";
import type { OrderStatusType } from "../types";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 👇 CALL API
  const { data: orderPage, isLoading, isError } = useGetAllOrders({ page, limit: 20, search });
  const orders = orderPage?.data || [];
  const pagination = orderPage?.pagination;
  const updateStatusMutation = useUpdateOrder();

  // ================= HANDLERS =================

  const handleView = (order: any) => {
    setSelectedOrder(order.raw || order);
    setOpen(true);
  };

  const handleDelete = (order: any) => {
    if (!confirm(`Hủy đơn ${order.orderId}?`)) return;

    updateStatusMutation.mutate({
      id: Number(order.id),
      data: { status: "CANCELLED" as OrderStatusType },
    }, {
      onSuccess: () => toast.success("Hủy đơn thành công"),
      onError: () => toast.error("Hủy đơn thất bại"),
    });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate(
      { id: Number(id), data: { status: status as OrderStatusType } },
      {
        onSuccess: () => toast.success("Cập nhật trạng thái thành công"),
        onError: () => toast.error("Cập nhật trạng thái thất bại"),
      }
    );
  };

  // ================= MAP DATA =================

  const mappedOrders = orders.map((o: any) => ({
    id: o.id,
    raw: o,
    orderId: `#${o.id}`,
    shop: o.shop?.name || o.items?.find((item: any) => item.shop?.name)?.shop?.name || "N/A",
    customer: o.user?.fullName || o.User?.fullName || "N/A",
    total: o.totalAmount || 0,
    items: o.items?.length || o.Items?.length || 0,
    status: o.status,
    date: o.createdAt || o.created_at,
  }));

  // ================= FILTER =================

  const filtered = mappedOrders.filter(
    (o: any) =>
      o.orderId.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.shop.toLowerCase().includes(search.toLowerCase())
  );
  const columns = orderColumns(
    handleView,
    handleDelete,
    handleUpdateStatus
  );
  if (isLoading) {
    return <div className="p-6">Đang tải đơn hàng...</div>;
  }
  if (isError) {
    return <div className="p-6 text-red-500">Lỗi tải đơn hàng</div>;
  }
  return (
    <main className="flex-1 overflow-auto p-6 w-full">

      <OrderStats orders={orders} />

      <div className="flex justify-end mb-4">
        <OrderFilter value={search} onChange={(value) => { setSearch(value); setPage(1); }} />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        pageSize={20}
        total={pagination?.total}
        page={page}
        onPageChange={setPage}
        title="Danh sách đơn hàng"
      />

      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        order={selectedOrder}
      />
    </main>
  );
}

