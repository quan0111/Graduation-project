import { OrderHeader } from "../../components/orderHeader";
import { OrderTimeline } from "../../components/orderTimeLine";
import { OrderShipping } from "../../components/shipping";
import { OrderItems } from "../../components/orderItems";
import { OrderSummary } from "../../components/summary";
import { OrderActions } from "../../components/orderAction";
import type { IOrder } from "../../types";

/* ---------- MOCK ---------- */

const now = new Date().toISOString();

const mockOrder: IOrder = {
  id: 1,
  user_id: 1,

  status: "SHIPPED",

  subtotal: 470000,
  shipping_fee: 30000,
  discount_amount: 20000,
  total_amount: 480000,

  created_at: now,
  updated_at: now,

  Items: [
    {
      id: 1,
      order_id: 1,
      product_id: 1,
      quantity: 2,
      price: 120000,
      product_name: "Áo thun basic",
      variant_name: "Size M",
      product_image: "https://picsum.photos/100?1",
      created_at: now,
    },
    {
      id: 2,
      order_id: 1,
      product_id: 2,
      quantity: 1,
      price: 230000,
      product_name: "Quần jean slim fit",
      variant_name: "Size L",
      product_image: "https://picsum.photos/100?2",
      created_at: now,
    },
  ],

  User: {
    id: 1,
    name: "Nguyễn Văn A",
  } as any,
};

/* ---------- PAGE ---------- */

export default function OrderDetailPage() {
  const order = mockOrder;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* header */}
      <OrderHeader order={order} />

      {/* timeline */}
      <OrderTimeline status={order.status} />

      {/* shipping */}
      <OrderShipping order={order} />

      {/* items */}
      <OrderItems items={order.Items ?? []} />

      {/* summary */}
      <OrderSummary order={order} />

      <OrderActions  />
    </div>
  );
}