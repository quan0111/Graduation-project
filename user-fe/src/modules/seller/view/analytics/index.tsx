import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, ClipboardList, PackageCheck, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetSellerOrders } from "@/modules/order/api/get-seller-orders";
import { getOrderVisibleSubtotal, getStatusMeta } from "@/modules/order/utils/order";
import { useSellerReport } from "@/modules/seller/api/finance";
import { useGetSellerDashboard } from "@/modules/seller/api/get-dashboard";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { formatCompactCurrency, formatCurrency } from "@/modules/seller/utils/dashboard";
import type { OrderStatusType } from "@/constant";

const orderStatusSequence: OrderStatusType[] = [
  "pending",
  "pending_payment",
  "paid",
  "payment_failed",
  "payment_expired",
  "confirmed",
  "processing",
  "ready_to_ship",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "completed",
  "cancel_requested",
  "cancelled_by_customer",
  "cancelled_by_seller",
  "cancel_rejected",
  "cancel_approved",
  "cancelled",
  "delivery_failed",
  "return_to_sender",
  "return_requested",
  "returned",
];

export default function SellerAnalyticsPage() {
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError } = useGetSellerDashboard();
  const { data: report, isLoading: reportLoading } = useSellerReport(30);
  const { data: orders = [] } = useGetSellerOrders();

  const revenueChart = useMemo(
    () =>
      (report?.dailyRevenue ?? dashboard?.salesTrend ?? []).map((item) => ({
        ...item,
        label:
          "date" in item
            ? new Date(item.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
            : item.label,
      })),
    [dashboard?.salesTrend, report?.dailyRevenue],
  );

  const statusRows = useMemo(() => {
    const counts = new Map<OrderStatusType, { count: number; revenue: number }>();
    orders.forEach((order) => {
      const current = counts.get(order.status) ?? { count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += getOrderVisibleSubtotal(order);
      counts.set(order.status, current);
    });

    return orderStatusSequence
      .map((status) => ({
        status,
        ...getStatusMeta(status),
        count: counts.get(status)?.count ?? 0,
        revenue: counts.get(status)?.revenue ?? 0,
      }))
      .filter((item) => item.count > 0);
  }, [orders]);

  const totalRevenue = dashboard?.overview.grossRevenue ?? 0;
  const totalOrders = dashboard?.overview.totalOrders ?? orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const completedOrders = statusRows
    .filter((item) => item.status === "completed" || item.status === "delivered")
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Seller Analytics</p>
              <h1 className="mt-3 text-2xl font-bold text-slate-950">Phân tích vận hành và doanh thu</h1>
              <p className="mt-2 text-sm text-slate-500">
                Dữ liệu tổng hợp từ đơn hàng, sản phẩm và báo cáo tài chính của shop.
              </p>
            </div>
            <Badge className="w-fit bg-orange-50 text-[#ee4d2d] hover:bg-orange-50">
              30 ngày gần nhất
            </Badge>
          </div>
        </div>

        {dashboardError ? (
          <Card className="border-0 bg-white shadow-sm ring-1 ring-rose-100">
            <CardContent className="p-6 text-sm text-rose-600">
              Không tải được dữ liệu phân tích seller.
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={TrendingUp} label="Doanh thu gộp" value={formatCurrency(totalRevenue)} loading={dashboardLoading} />
          <MetricCard icon={ClipboardList} label="Tổng đơn shop" value={String(totalOrders)} loading={dashboardLoading} />
          <MetricCard icon={PackageCheck} label="Đơn hoàn tất/giao" value={String(completedOrders)} loading={dashboardLoading} />
          <MetricCard icon={Activity} label="Giá trị đơn TB" value={formatCurrency(averageOrderValue)} loading={dashboardLoading} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_420px]">
          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Xu hướng doanh thu</CardTitle>
              <p className="text-sm text-slate-500">
                {report?.totalOrders ?? totalOrders} đơn · huỷ {report?.cancelRate ?? 0}% · trả hàng {report?.returnRate ?? 0}%
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {reportLoading || dashboardLoading ? (
                  <div className="h-full animate-pulse rounded-2xl bg-slate-100" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChart}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatCompactCurrency(Number(value))} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area dataKey="revenue" stroke="#ee4d2d" fill="#fed7aa" strokeWidth={3} type="monotone" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Trạng thái đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusRows}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} hide />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value, name) => [value, name === "count" ? "Số đơn" : "Doanh thu"]} />
                    <Bar dataKey="count" fill="#ee4d2d" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusRows.map((item) => (
                  <div key={item.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge className={`bg-transparent ring-1 ${item.chip}`}>{item.label}</Badge>
                      <span className="text-slate-500">{item.count} đơn</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Top sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(report?.topProducts ?? dashboard?.topProducts ?? []).slice(0, 8).map((product) => (
                <div key={"productId" in product ? product.productId : `${product.id}-${product.variantId ?? "product"}`} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">Đã bán {product.sold}</p>
                  </div>
                  <p className="font-semibold text-[#ee4d2d]">{formatCurrency(product.revenue)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle>Điểm cần xử lý</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Insight label="Chờ xác nhận" value={dashboard?.todo.pending ?? 0} tone="amber" />
              <Insight label="Đang xử lý" value={dashboard?.todo.processing ?? 0} tone="blue" />
              <Insight label="Đang giao" value={dashboard?.todo.shipping ?? 0} tone="cyan" />
              <Insight label="Trả hàng" value={dashboard?.todo.returns ?? 0} tone="rose" />
              <Insight label="Sắp hết hàng" value={dashboard?.overview.lowStockProducts ?? 0} tone="orange" />
              <Insight label="Hết hàng" value={dashboard?.overview.outOfStockProducts ?? 0} tone="slate" />
            </CardContent>
          </Card>
        </div>
      </section>
    </SellerDashboardLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{loading ? "..." : value}</p>
        </div>
        <div className="rounded-2xl bg-orange-100 p-3 text-[#ee4d2d]">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Insight({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "blue" | "cyan" | "rose" | "orange" | "slate";
}) {
  const toneClass = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    cyan: "bg-cyan-50 text-cyan-700",
    rose: "bg-rose-50 text-rose-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="text-sm">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
