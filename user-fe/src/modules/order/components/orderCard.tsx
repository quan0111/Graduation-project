import { Card } from "@/components/ui/card";
import { OrderHeader } from "./orderHeader";
import { OrderDetails } from "./orderDetail";
import type { IOrder } from "../types";

interface OrderCardProps {
  order: IOrder;
  expanded: boolean;
  onToggle: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  expanded,
  onToggle,
}) => {
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <OrderHeader order={order} onClick={onToggle} />

      {/* content */}
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${expanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <OrderDetails order={order} />
      </div>
    </Card>
  );
};