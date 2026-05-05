import { useGetOrder } from "../../api/get-orders";
import { OrdersFilterTabs } from "../../components/filterTab";
import { OrderCard } from "../../components/orderCard";
import { EmptyState } from "@/modules/order/components/emptyState";
import type { IOrder } from "../../types";
import { useState, useMemo } from "react";

/* ---------- PAGE ---------- */

export default function OrderPage() {
  const { data: ordersData, isLoading } = useGetOrder();
  
  // Filter state
  const [filter, setFilter] = useState<IOrder["status"] | "ALL">("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  // Transform API data
  const orders: IOrder[] = ordersData?.data?.data || [];

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (filter === "ALL") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  // Toggle expand order details
  const toggleExpand = (orderId: number) => {
    setExpanded(expanded === orderId ? null : orderId);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Filter tabs */}
      <OrdersFilterTabs
        filter={filter.toLocaleLowerCase() as any}
        setFilter={(value) => setFilter(value.toUpperCase() as any)}
      />

      {/* Order list */}
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
