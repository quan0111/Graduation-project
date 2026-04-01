import { useOrders } from "../../hook/useOrder";
import { OrdersFilterTabs } from "../../components/filterTab";
import { OrderCard } from "../../components/orderCard";
import { EmptyState } from "@/modules/order/components/emptyState";
import type { IOrder } from "../../types";

/* ---------- MOCK ---------- */

const now = new Date().toISOString();

const statuses: IOrder["status"][] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);

const createOrder = (id: number): IOrder => {
  const itemCount = random(1, 4);

  const items = Array.from({ length: itemCount }, (_, i) => ({
    id: i + 1,
    order_id: id,
    product_id: i + 1,
    quantity: random(1, 3),
    price: random(100000, 500000),
    product_name: `Sản phẩm ${i + 1}`,
    variant_name: "Default",
    product_image: `https://picsum.photos/100?random=${id + i}`,
    created_at: now,
  }));

  const subtotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  const shipping = 30000;
  const discount = random(0, 50000);

  return {
    id,
    user_id: 1,

    status: statuses[id % statuses.length],

    subtotal,
    shipping_fee: shipping,
    discount_amount: discount,
    total_amount: subtotal + shipping - discount,

    created_at: now,
    updated_at: now,

    Items: items,
  };
};

/* 👉 tạo 18 đơn */
const mockOrders: IOrder[] = Array.from({ length: 18 }, (_, i) =>
  createOrder(i + 1)
);

/* ---------- PAGE ---------- */

export default function OrderPage() {
  const {
    filter,
    setFilter,
    expanded,
    toggleExpand,
    orders: filtered,
  } = useOrders(mockOrders);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* filter */}
      <OrdersFilterTabs
        filter={filter.toLocaleLowerCase() as any}
        setFilter={(value) => setFilter(value.toUpperCase() as any)}
      />

      {/* list */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        filtered.map((o) => (
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