import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, CheckCircle2, Clock, ExternalLink, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { OrderStatusType } from "@/constant";
import { useGetSellerOrders } from "@/modules/order/api/get-seller-orders";
import { useUpsertShipment } from "@/modules/order/api/upsert-shipment";
import type { IOrder, IOrderShopPackage, IShipment, ShipmentStatusType } from "@/modules/order/types";
import { formatDateTime, getOrderVisibleSubtotal, getStatusMeta } from "@/modules/order/utils/order";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { formatCurrency } from "@/modules/seller/utils/dashboard";

type ShippingFilter = "all" | "need_tracking" | "ready" | "moving" | "done";

const shipmentNextStatus: Partial<Record<OrderStatusType, ShipmentStatusType>> = {
  processing: "ready_to_ship",
  ready_to_ship: "shipped",
  shipped: "in_transit",
  in_transit: "out_for_delivery",
  out_for_delivery: "delivered",
  delivery_failed: "return_to_sender",
};

const filterOptions: Array<{ value: ShippingFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "need_tracking", label: "Chưa có tracking" },
  { value: "ready", label: "Chờ gửi" },
  { value: "moving", label: "Đang giao" },
  { value: "done", label: "Đã giao" },
];

const requiresHandoverInfo = (row: ShippingRow) =>
  row.nextStatus === "shipped" && (!row.carrier?.trim() || !row.trackingNumber?.trim());

export default function SellerShippingPage() {
  const [filter, setFilter] = useState<ShippingFilter>("all");
  const { data: orders = [], isLoading, isError } = useGetSellerOrders();
  const shipmentMutation = useUpsertShipment();

  const rows = useMemo(() => orders.map(toShippingRow), [orders]);

  const metrics = useMemo(
    () => ({
      total: rows.length,
      needTracking: rows.filter((row) => !row.trackingNumber).length,
      ready: rows.filter((row) => row.status === "ready_to_ship").length,
      moving: rows.filter((row) =>
        ["shipped", "in_transit", "out_for_delivery", "delivery_failed", "return_to_sender"].includes(row.status),
      ).length,
      done: rows.filter((row) => row.status === "delivered" || row.status === "completed").length,
    }),
    [rows],
  );

  const filteredRows = rows.filter((row) => {
    if (filter === "all") return true;
    if (filter === "need_tracking") return !row.trackingNumber;
    if (filter === "ready") return row.status === "ready_to_ship";
    if (filter === "moving") return ["shipped", "in_transit", "out_for_delivery", "delivery_failed", "return_to_sender"].includes(row.status);
    return row.status === "delivered" || row.status === "completed";
  });

  const handleAdvance = async (row: ShippingRow) => {
    if (!row.nextStatus) return;
    if (requiresHandoverInfo(row)) {
      toast.error("Cần nhập đơn vị vận chuyển và mã vận đơn trước khi đánh dấu đã gửi hàng");
      return;
    }

    try {
      await shipmentMutation.mutateAsync({
        orderId: row.order.id,
        carrier: row.carrier || undefined,
        trackingNumber: row.trackingNumber || undefined,
        status: row.nextStatus,
        hasExisting: row.hasPackageOrShipment,
      });
      toast.success("Đã cập nhật tracking nội bộ");
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Không thể cập nhật vận chuyển");
    }
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Vận chuyển người bán</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">Vận chuyển và tracking nội bộ</h1>
              <p className="mt-2 text-sm text-slate-500">
                Khi chưa nối đơn vị vận chuyển, seller cập nhật trạng thái tại đây để hóa đơn hiển thị đủ các bước.
              </p>
            </div>
            <Link to="/seller/orders" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink className="size-4" />
              Danh sách đơn hàng
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Metric icon={Box} label="Package shop" value={String(metrics.total)} />
          <Metric icon={Clock} label="Chưa tracking" value={String(metrics.needTracking)} />
          <Metric icon={PackageCheck} label="Chờ gửi" value={String(metrics.ready)} />
          <Metric icon={Truck} label="Đang giao" value={String(metrics.moving)} />
          <Metric icon={CheckCircle2} label="Đã giao" value={String(metrics.done)} />
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(option.value)}
              className={filter === option.value ? "bg-[#ee4d2d] hover:bg-[#d93f21]" : ""}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Đang tải vận chuyển...</p> : null}
        {isError ? <p className="text-sm text-rose-500">Không thể tải dữ liệu vận chuyển.</p> : null}

        <div className="space-y-4">
          {filteredRows.map((row) => {
            const meta = getStatusMeta(row.status);

            return (
              <Card key={`${row.order.id}-${row.packageId ?? "single"}`} className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
                <CardContent className="p-5">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link to={`/seller/orders/${row.order.id}`} className="text-lg font-semibold text-slate-950 hover:text-[#ee4d2d]">
                          Đơn #{row.order.id}
                        </Link>
                        <Badge className={`bg-transparent ring-1 ${meta.chip}`}>{meta.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span>Khách: {row.order.user?.full_name || row.order.user?.email || `#${row.order.user_id}`}</span>
                        <span>{formatDateTime(row.order.created_at)}</span>
                        <span>{row.order.items.length} dòng sản phẩm</span>
                        <span>{formatCurrency(getOrderVisibleSubtotal(row.order))}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-3 xl:min-w-130">
                      <Info label="Đơn vị" value={row.carrier || "Tự vận chuyển"} />
                      <Info label="Mã vận đơn" value={row.trackingNumber || "Chưa cập nhật"} />
                      <Info label="Cập nhật" value={formatDateTime(row.lastUpdated)} />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid flex-1 gap-3 md:grid-cols-4">
                      {buildShippingSteps(row.status).map((step) => (
                        <div key={step.key} className={step.active ? "text-[#ee4d2d]" : "text-slate-400"}>
                          <div className={step.active ? "h-1 rounded-full bg-[#ee4d2d]" : "h-1 rounded-full bg-slate-200"} />
                          <p className="mt-2 text-xs font-medium">{step.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {row.nextStatus && requiresHandoverInfo(row) ? (
                        <Link
                          to={`/seller/orders/${row.order.id}`}
                          className={buttonVariants({ variant: "outline" })}
                        >
                          Nhập vận chuyển
                        </Link>
                      ) : row.nextStatus ? (
                        <Button
                          className="bg-[#ee4d2d] hover:bg-[#d93f21]"
                          onClick={() => handleAdvance(row)}
                          disabled={shipmentMutation.isPending}
                        >
                          {shipmentMutation.isPending ? "Đang lưu..." : getAdvanceLabel(row.nextStatus)}
                        </Button>
                      ) : null}
                      <Link to={`/seller/orders/${row.order.id}`} className={buttonVariants({ variant: "outline" })}>
                        Mở hóa đơn
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!isLoading && filteredRows.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            Không có package phù hợp bộ lọc hiện tại.
          </div>
        ) : null}
      </section>
    </SellerDashboardLayout>
  );
}

interface ShippingRow {
  order: IOrder;
  packageId?: number;
  status: OrderStatusType;
  carrier?: string | null;
  trackingNumber?: string | null;
  lastUpdated?: string | null;
  nextStatus?: ShipmentStatusType;
  hasPackageOrShipment: boolean;
}

function toShippingRow(order: IOrder): ShippingRow {
  const source = (order.shop_package ?? order.shipment ?? null) as IOrderShopPackage | IShipment | null;
  const rawStatus = (source?.status ?? order.status) as OrderStatusType;
  const status = rawStatus in getStatusSafeMap() ? rawStatus : order.status;
  const sourceWithDates = source as (IOrderShopPackage | IShipment | null);

  return {
    order,
    packageId: "shop_id" in (source ?? {}) ? (source as IOrderShopPackage).id : undefined,
    status,
    carrier: source?.carrier ?? null,
    trackingNumber: source?.tracking_number ?? null,
    lastUpdated: sourceWithDates?.delivered_at ?? sourceWithDates?.shipped_at ?? order.updated_at ?? order.created_at,
    nextStatus: shipmentNextStatus[status],
    hasPackageOrShipment: Boolean(order.shop_package || order.shipment),
  };
}

function getStatusSafeMap(): Record<OrderStatusType, true> {
  return {
    pending: true,
    pending_payment: true,
    confirmed: true,
    paid: true,
    payment_failed: true,
    payment_expired: true,
    processing: true,
    ready_to_ship: true,
    shipped: true,
    in_transit: true,
    out_for_delivery: true,
    delivered: true,
    completed: true,
    cancel_requested: true,
    cancelled_by_customer: true,
    cancelled_by_seller: true,
    cancel_rejected: true,
    cancel_approved: true,
    cancelled: true,
    delivery_failed: true,
    return_to_sender: true,
    return_requested: true,
    returned: true,
  };
}

function buildSteps(status: OrderStatusType) {
  const steps: Array<{ key: OrderStatusType; label: string }> = [
    { key: "ready_to_ship", label: "Chờ gửi" },
    { key: "shipped", label: "Đã gửi" },
    { key: "in_transit", label: "Đang giao" },
    { key: "delivered", label: "Đã giao" },
  ];
  const index = steps.findIndex((step) => step.key === status);
  return steps.map((step, stepIndex) => ({
    ...step,
    active: index >= 0 && stepIndex <= index,
  }));
}

function buildShippingSteps(status: OrderStatusType) {
  void buildSteps;
  const steps: Array<{ key: OrderStatusType; label: string }> =
    ["delivery_failed", "return_to_sender"].includes(status)
      ? [
          { key: "ready_to_ship", label: "Chờ gửi" },
          { key: "shipped", label: "Đã gửi" },
          { key: "in_transit", label: "Đang vận chuyển" },
          { key: "delivery_failed", label: "Giao thất bại" },
          { key: "return_to_sender", label: "Hoàn về" },
        ]
      : [
          { key: "ready_to_ship", label: "Chờ gửi" },
          { key: "shipped", label: "Đã gửi" },
          { key: "in_transit", label: "Đang vận chuyển" },
          { key: "out_for_delivery", label: "Đang giao" },
          { key: "delivered", label: "Đã giao" },
        ];
  const index = steps.findIndex((step) => step.key === status);
  return steps.map((step, stepIndex) => ({
    ...step,
    active: index >= 0 && stepIndex <= index,
  }));
}

function getAdvanceLabel(status: ShipmentStatusType) {
  const labels: Partial<Record<ShipmentStatusType, string>> = {
    ready_to_ship: "Đánh dấu chờ gửi",
    shipped: "Đã gửi hàng",
    in_transit: "Đang vận chuyển",
    delivered: "Đã giao hàng",
  };
  return labels[status] ?? ({
    ready_to_ship: "Đánh dấu chờ gửi",
    shipped: "Đã gửi hàng",
    in_transit: "Đang vận chuyển",
    out_for_delivery: "Đang giao hàng",
    delivery_failed: "Giao thất bại",
    return_to_sender: "Hoàn về seller",
    delivered: "Đã giao hàng",
  } satisfies Record<ShipmentStatusType, string>)[status];
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-orange-100 p-3 text-[#ee4d2d]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 truncate font-medium text-slate-950">{value}</p>
    </div>
  );
}
