'use client';

import { useGetOrder } from "../../api/get-orders";
import { OrdersFilterTabs } from "../../components/filterTab";
import { OrderCard } from "../../components/orderCard";
import { EmptyState } from "@/modules/order/components/emptyState";
import type { IOrder } from "../../types";
import { useState, useMemo } from "react";
import type { OrderStatusType } from "@/constant";

type OrderFilterType = "ALL" | OrderStatusType;

export default function OrderPage() {
  const { data: ordersData, isLoading, error } = useGetOrder();

  const [filter, setFilter] = useState<OrderFilterType>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  // ✅ API của bạn trả ARRAY trực tiếp
  const orders: IOrder[] = ordersData || [];

  console.log("🚀 ORDERS:", orders);

  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;

    return orders.filter(
      (order) =>
        order.status?.toUpperCase() === filter.toUpperCase()
    );
  }, [orders, filter]);

  const toggleExpand = (orderId: number) => {
    setExpanded(expanded === orderId ? null : orderId);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  if (error) {
    return <div className="p-6 text-red-500">Lỗi load đơn hàng</div>;
  }

  if (!orders.length) return <EmptyState />;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <OrdersFilterTabs
        filter={filter}
        setFilter={(value) => setFilter(value as any)}
      />

      {filteredOrders.length === 0 ? (
        <EmptyState />
      ) : (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            expanded={expanded === order.id}
            onToggle={() => toggleExpand(order.id)}
          />
        ))
      )}
    </div>
  );
}