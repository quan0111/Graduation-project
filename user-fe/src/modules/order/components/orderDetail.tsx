// OrderDetails.tsx
import { OrderItems } from "./OrderItems";
import { OrderTimeline } from "./OrderTimeline";
import { OrderActions } from "./OrderActions";

export const OrderDetails = ({ order }) => {
  return (
    <div className="p-6 space-y-6 bg-muted/20">
      <OrderItems items={order.items_detail} />
      <OrderTimeline status={order.status} />
      <OrderActions order={order} />
    </div>
  );
};