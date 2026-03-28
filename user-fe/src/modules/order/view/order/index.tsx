// page.tsx
import { useOrders } from "@/hooks/useOrders";
import { OrdersFilterTabs } from "@/components/orders/OrdersFilterTabs";
import { OrderCard } from "@/components/orders/OrderCard";
import { EmptyState } from "@/components/orders/EmptyState";

export default function OrderPage({ orders }) {
  const {
    filter,
    setFilter,
    expanded,
    toggleExpand,
    orders: filtered
  } = useOrders(orders);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">

      <OrdersFilterTabs filter={filter} setFilter={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map(o => (
          <OrderCard
            key={o.id}
            order={o}
            expanded={expanded === o.id}
            onToggle={() => toggleExpand(o.id)}
          />
        ))
      )}
    </div>
  );
}