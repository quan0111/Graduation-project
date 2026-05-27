import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, Truck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";

import { useGetSellerOrders } from "@/modules/order/api/get-seller-orders";
import { formatCurrency, formatDateTime, getOrderVisibleSubtotal, getStatusMeta } from "@/modules/order/utils/order";

export default function SellerOrdersPage() {
  const { data: orders = [], isLoading, isError } = useGetSellerOrders();

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-4xl bg-[radial-gradient(circle_at_top_left,rgba(238,77,45,0.14),transparent_36%),linear-gradient(135deg,#111827,#1f2937)] px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-orange-200">Đơn hàng người bán</p>
              <h1 className="mt-3 text-3xl font-semibold">Hóa đơn và tracking theo shop của bạn</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Chỉ các sản phẩm thuộc shop hiện tại mới được hiển thị. Seller không thấy dữ liệu của shop khác trong cùng một đơn.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Metric label="Đơn khả dụng" value={String(orders.length)} icon={<ClipboardList className="size-4" />} />
              <Metric
                label="Đơn có tracking"
                value={String(orders.filter((order) => order.shop_package?.tracking_number || order.shipment?.tracking_number).length)}
                icon={<Truck className="size-4" />}
              />
            </div>
          </div>
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Đang tải đơn hàng seller...</p> : null}
        {isError ? <p className="text-sm text-rose-500">Không thể tải đơn hàng của shop.</p> : null}

        {!isLoading && !orders.length ? (
          <div className="rounded-4xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-950">Chưa có đơn hàng cho shop này</p>
            <p className="mt-2 text-sm text-slate-500">
              Khi khách đặt hàng, seller có thể xem hóa đơn theo shop và cập nhật tracking từ đây.
            </p>
          </div>
        ) : null}

        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusMeta(order.status);

            return (
              <article
                key={order.id}
                className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-slate-950">#{order.id}</p>
                      <Badge className={`bg-transparent ring-1 ${status.chip}`}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      <span>Khách: {order.user?.full_name || order.user?.email || `#${order.user_id}`}</span>
                      <span>{formatDateTime(order.created_at)}</span>
                      <span>{order.items.length} sản phẩm thuộc shop</span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Giá trị shop</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {formatCurrency(getOrderVisibleSubtotal(order))}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Tracking: {order.shop_package?.tracking_number || order.shipment?.tracking_number || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product_image || "/placeholder.png"}
                          className="size-12 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
                          <p className="text-xs text-slate-500">
                            {item.variant_name || "Mặc định"} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/seller/orders/${order.id}`}
                    className={`${buttonVariants()} inline-flex bg-[#ee4d2d] hover:bg-[#d93f21]`}
                  >
                    Mở hóa đơn shop
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </SellerDashboardLayout>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-orange-200">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
