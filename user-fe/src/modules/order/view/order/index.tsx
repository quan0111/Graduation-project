'use client';

import { useMemo, useState, type ReactNode } from "react";
import { ClipboardList, Wallet } from "lucide-react";

import type { OrderStatusType } from "@/constant";

import { useGetOrder } from "../../api/get-orders";
import { EmptyState } from "../../components/emptyState";
import { OrdersFilterTabs } from "../../components/filterTab";
import { OrderCard } from "../../components/orderCard";
import { formatCurrency } from "../../utils/order";
import type { IOrder } from "../../types";

type OrderFilterType = "ALL" | OrderStatusType;

export default function OrderPage() {
  const { data: orders = [], isLoading, error } = useGetOrder();
  const [filter, setFilter] = useState<OrderFilterType>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.status === filter);
  }, [filter, orders]);

  const totalSpent = useMemo(
    () => orders.reduce((sum, order) => sum + order.total_amount, 0),
    [orders],
  );

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải danh sách đơn hàng...</div>;
  }

  if (error) {
    return <div className="p-6 text-sm text-rose-500">Không thể tải đơn hàng.</div>;
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <section className="rounded-4xl bg-[radial-gradient(circle_at_top_left,rgba(238,77,45,0.18),transparent_36%),linear-gradient(135deg,#111827,#1f2937)] px-6 py-8 text-white shadow-lg">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-orange-200">Trung tâm đơn hàng</p>
              <h1 className="mt-3 text-3xl font-semibold">Đơn hàng và hóa đơn của bạn</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Theo dõi trạng thái đơn, xem hóa đơn chi tiết và kiểm tra tiến độ giao hàng trong cùng một nơi.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <MetricCard
                icon={<ClipboardList className="size-5" />}
                label="Tổng đơn"
                value={String(orders.length)}
              />
              <MetricCard
                icon={<Wallet className="size-5" />}
                label="Tổng chi tiêu"
                value={formatCurrency(totalSpent)}
              />
            </div>
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <OrdersFilterTabs filter={filter} setFilter={setFilter} />

          {filteredOrders.length ? (
            <div className="space-y-4">
              {filteredOrders.map((order: IOrder) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expanded === order.id}
                  onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-3 text-orange-200">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
