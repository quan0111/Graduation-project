'use client';

import { useState } from 'react';
import { DataTable } from "@/components/common/data-table";
import { getAdminOrderActionLabel, getOrderStatusLabel, orderColumns } from "../components/order-collums";
import { OrderStats } from "../components/order-stats";
import { OrderFilter } from "../components/search-filter-order";
import { OrderDetailModal } from "../components/order-detail-modal";
import { getAllOrders, useGetAllOrders } from "../api/get-all-orders";
import { useUpdateOrder } from "../api/update-order";
import { TextPromptDialog } from "@/components/common/app-dialog";
import { toast } from "sonner";
import type { OrderStatusType } from "../types";

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [statusTarget, setStatusTarget] = useState<{ order: any; status: OrderStatusType } | null>(null);

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
    setCancelTarget(order);
  };

  const handleConfirmDelete = (reason: string) => {
    if (!cancelTarget) return;
    updateStatusMutation.mutate({
      id: Number(cancelTarget.id),
      data: { status: "CANCELLED" as OrderStatusType, reason },
    }, {
      onSuccess: () => {
        toast.success("Hủy đơn thành công");
        setCancelTarget(null);
      },
      onError: (error: any) => {
        const detail = error?.response?.data?.detail;
        toast.error(typeof detail === "string" ? detail : "Hủy đơn thất bại");
      },
    });
  };

  const handleUpdateStatus = (id: string, status: string) => {
    const order = mappedOrders.find((item) => String(item.id) === String(id));
    setStatusTarget({ order: order || { id, orderId: `#${id}` }, status: status as OrderStatusType });
  };

  const handleConfirmUpdateStatus = (reason: string) => {
    if (!statusTarget) return;
    updateStatusMutation.mutate(
      { id: Number(statusTarget.order.id), data: { status: statusTarget.status, reason } },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công");
          setStatusTarget(null);
        },
        onError: (error: any) => {
          const detail = error?.response?.data?.detail;
          toast.error(typeof detail === "string" ? detail : "Cập nhật trạng thái thất bại");
        },
      }
    );
  };

  // ================= MAP DATA =================

  const mapOrder = (o: any) => ({
    id: o.id,
    raw: o,
    orderId: `#${o.id}`,
    checkoutGroupCode: o.checkoutGroupCode || o.checkoutGroup?.code || null,
    checkoutGroupPrimary: Boolean(o.checkoutGroupPrimary),
    checkoutGroupOrderCount: o.checkoutGroup?.orders?.length || null,
    shop:
      o.shop?.name ||
      o.Shop?.name ||
      (o.items || o.Items || []).find((item: any) => item.shop?.name || item.Shop?.name)?.shop?.name ||
      (o.items || o.Items || []).find((item: any) => item.shop?.name || item.Shop?.name)?.Shop?.name ||
      "N/A",
    customer: o.user?.fullName || o.User?.fullName || o.user?.email || o.User?.email || "N/A",
    total: o.totalAmount ?? o.total_amount ?? o.total ?? 0,
    items: o.items?.length || o.Items?.length || 0,
    status: o.status,
    date: o.createdAt || o.created_at,
  });

  const mappedOrders = orders.map(mapOrder);

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
        data={mappedOrders}
        columns={columns}
        pageSize={20}
        total={pagination?.total}
        page={page}
        onPageChange={setPage}
        exportRows={async () => {
          const total = pagination?.total || 10000;
          const response = await getAllOrders({ page: 1, limit: Math.max(total, 1), search });
          return response.data.map(mapOrder);
        }}
        title="Danh sách đơn hàng"
      />

      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        order={selectedOrder}
      />

      <TextPromptDialog
        open={Boolean(cancelTarget)}
        title="Hủy đơn hàng"
        description={cancelTarget ? `Hủy đơn ${cancelTarget.orderId}?` : ""}
        confirmLabel="Hủy đơn"
        label="Lý do"
        placeholder="Nhập lý do hủy đơn"
        multiline
        isPending={updateStatusMutation.isPending}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <TextPromptDialog
        open={Boolean(statusTarget)}
        title="Đổi trạng thái đơn hàng"
        description={
          statusTarget
            ? `${getAdminOrderActionLabel(statusTarget.order.status, statusTarget.status)} ${statusTarget.order.orderId}? Trạng thái hiện tại: ${getOrderStatusLabel(statusTarget.order.status)}.`
            : ""
        }
        confirmLabel="Cập nhật"
        isPending={updateStatusMutation.isPending}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        onConfirm={handleConfirmUpdateStatus}
      />
    </main>
  );
}

