import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

import { useGetSellerOrderById } from "@/modules/order/api/get-seller-order";
import { useUpdateOrder } from "@/modules/order/api/update-order";
import { useUpsertShipment } from "@/modules/order/api/upsert-shipment";
import { OrderItems } from "@/modules/order/components/orderItems";
import { OrderShipping } from "@/modules/order/components/shipping";
import { OrderSummary } from "@/modules/order/components/summary";
import { OrderTimeline } from "@/modules/order/components/orderTimeLine";
import type { ShipmentStatusType } from "@/modules/order/types";
import type { OrderStatusType } from "@/constant";
import {
  formatCurrency,
  formatDateTime,
  getOrderVisibleSubtotal,
  getStatusMeta,
} from "@/modules/order/utils/order";

const shipmentStatuses: Array<{ value: ShipmentStatusType; label: string }> = [
  { value: "ready_to_ship", label: "Sẵn sàng giao" },
  { value: "shipped", label: "Đã gửi hàng" },
  { value: "in_transit", label: "Đang vận chuyển" },
  { value: "delivered", label: "Đã giao hàng" },
];

const sellerOrderTransitions: Partial<Record<OrderStatusType, Array<{ status: OrderStatusType; label: string }>>> = {
  pending: [{ status: "confirmed", label: "Xác nhận đơn" }],
  paid: [
    { status: "confirmed", label: "Xác nhận đơn" },
    { status: "processing", label: "Chuyển sang xử lý" },
  ],
  confirmed: [{ status: "processing", label: "Bắt đầu xử lý" }],
  processing: [{ status: "ready_to_ship", label: "Sẵn sàng giao" }],
  ready_to_ship: [{ status: "shipped", label: "Đã gửi hàng" }],
  shipped: [{ status: "in_transit", label: "Đang vận chuyển" }],
  in_transit: [{ status: "delivered", label: "Đã giao hàng" }],
};

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);
  const queryClient = useQueryClient();
  const { data: order, isLoading, isError } = useGetSellerOrderById(orderId, {
    enabled: !!orderId,
  });
  const shipmentMutation = useUpsertShipment();
  const orderStatusMutation = useUpdateOrder();

  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState<ShipmentStatusType>("ready_to_ship");

  useEffect(() => {
    if (!order?.shipment) {
      return;
    }

    setCarrier(order.shipment.carrier || "");
    setTrackingNumber(order.shipment.tracking_number || "");
    setStatus(order.shipment.status);
  }, [order?.shipment]);

  if (isLoading) {
    return (
      <SellerDashboardLayout>
        <p className="text-sm text-slate-500">Đang tải hóa đơn seller...</p>
      </SellerDashboardLayout>
    );
  }

  if (isError || !order) {
    return (
      <SellerDashboardLayout>
        <p className="text-sm text-rose-500">Không thể tải hóa đơn của shop.</p>
      </SellerDashboardLayout>
    );
  }

  const statusMeta = getStatusMeta(order.status);
  const nextOrderStatuses = sellerOrderTransitions[order.status] ?? [];

  const handleUpdateOrderStatus = async (nextStatus: OrderStatusType) => {
    try {
      await orderStatusMutation.mutateAsync({
        id: String(order.id),
        data: { status: nextStatus },
      });
      await queryClient.invalidateQueries({ queryKey: ["orders", "seller-detail", order.id] });
      await queryClient.invalidateQueries({ queryKey: ["orders", "seller"] });
      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể cập nhật trạng thái đơn hàng");
    }
  };

  const handleSaveTracking = async () => {
    try {
      await shipmentMutation.mutateAsync({
        orderId: order.id,
        carrier,
        trackingNumber,
        status,
        hasExisting: Boolean(order.shipment),
      });

      toast.success("Đã cập nhật tracking");
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Không thể cập nhật tracking");
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div>
          <Link
            to="/seller/orders"
            className={`${buttonVariants({ variant: "outline" })} inline-flex`}
          >
            <ChevronLeft className="size-4" />
            Quay lại danh sách đơn
          </Link>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Shop Invoice</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-950">Đơn #{order.id}</h1>
              <p className="mt-2 text-sm text-slate-500">
                Tạo lúc {formatDateTime(order.created_at)}. Chỉ hiển thị các sản phẩm thuộc shop của bạn.
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="inline-flex rounded-full bg-transparent px-3 py-1 text-sm font-medium ring-1 ring-inset">
                <span className={statusMeta.tone}>{statusMeta.label}</span>
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-400">Giá trị shop</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">
                {formatCurrency(getOrderVisibleSubtotal(order))}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
          <section className="space-y-6">
            <OrderTimeline status={order.status} />
            <OrderShipping order={order} />

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <div className="mb-5">
                <p className="text-lg font-semibold text-slate-950">Sản phẩm thuộc shop</p>
                <p className="text-sm text-slate-500">
                  Những sản phẩm khác trong cùng order không xuất hiện tại đây.
                </p>
              </div>
              <OrderItems items={order.items} />
            </div>
          </section>

          <aside className="space-y-6">
            <OrderSummary order={order} sellerView />

            {nextOrderStatuses.length > 0 && (
              <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
                <p className="text-base font-semibold text-slate-950">Cập nhật trạng thái đơn</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Chỉ hiển thị các bước hợp lệ theo trạng thái hiện tại của đơn hàng.
                </p>
                <div className="mt-5 space-y-2">
                  {nextOrderStatuses.map((option) => (
                    <Button
                      key={option.status}
                      className="w-full bg-slate-950 hover:bg-slate-800"
                      onClick={() => handleUpdateOrderStatus(option.status)}
                      disabled={orderStatusMutation.isPending}
                    >
                      {orderStatusMutation.isPending ? "Đang cập nhật..." : option.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
              <p className="text-base font-semibold text-slate-950">Chỉnh sửa tracking</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tracking hiện được cập nhật ở cấp order. Nếu backend trả lỗi đơn nhiều shop,
                bạn cần tách shipment theo shop ở tầng dữ liệu.
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Đơn vị vận chuyển</label>
                  <Input
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                    placeholder="VD: GHN, GHTK, SPX Express"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mã vận đơn</label>
                  <Input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="Nhập tracking number"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as ShipmentStatusType)}
                    className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#ee4d2d]"
                  >
                    {(() => {
                      // Normalize current status for transition check (matching backend logic)
                      const normalize = (s: string) => s.toUpperCase();

                      const currentBase = normalize(order.shipment?.status || "ready_to_ship");
                      const transitions: Record<string, string[]> = {
                        READY_TO_SHIP: ["SHIPPED"],
                        SHIPPED: ["IN_TRANSIT"],
                        IN_TRANSIT: ["DELIVERED"],
                      };

                      const allowedNextBase = transitions[currentBase] || [];
                      
                      return shipmentStatuses.filter(option => {
                        if (option.value === status) return true; // Keep current selection
                        const optionBase = normalize(option.value);
                        if (optionBase === currentBase) return true; // Allow same base status
                        return allowedNextBase.includes(optionBase);
                      }).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ));
                    })()}
                  </select>
                </div>

                <Button
                  className="w-full bg-[#ee4d2d] hover:bg-[#d93f21]"
                  onClick={handleSaveTracking}
                  disabled={shipmentMutation.isPending}
                >
                  <Save className="size-4" />
                  {shipmentMutation.isPending ? "Đang lưu..." : "Lưu tracking"}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </SellerDashboardLayout>
  );
}
