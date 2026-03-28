// page.tsx
import { OrderHeader } from "@/components/order-detail/sections/OrderHeader";
import { OrderTimeline } from "@/components/order-detail/sections/OrderTimeline";
import { OrderShipping } from "@/components/order-detail/sections/OrderShipping";
import { OrderItems } from "@/components/order-detail/sections/OrderItems";
import { OrderSummary } from "@/components/order-detail/sections/OrderSummary";
import { OrderActions } from "@/components/order-detail/sections/OrderActions";
import { OrderSupport } from "@/components/order-detail/sections/OrderSupport";

export default function Page({ order }) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">

      <OrderHeader order={order} />

      <OrderTimeline timeline={order.timeline} />

      <OrderShipping order={order} />

      <OrderItems items={order.items} />

      <OrderSummary order={order} />

      <OrderActions />

      <OrderSupport />

    </div>
  );
}