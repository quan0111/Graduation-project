import { OrderItems } from "./orderItems";
import { OrderTimeline } from "./orderTimeLine";
import { OrderActions } from "./orderAction";
import type { IOrder } from "../types";

interface OrderDetailsProps {
  order: IOrder;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  return (
    <div className="p-6 space-y-6 bg-muted/20">
      {/* items */}
      <OrderItems items={order.Items ?? []} />

      {/* timeline */}
      <OrderTimeline status={order.status} />

      <OrderActions  />
    </div>
  );
};