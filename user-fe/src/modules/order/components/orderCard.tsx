import { Card } from "@/components/ui/card";

import { OrderDetails } from "./orderDetail";
import { OrderHeader } from "./orderHeader";
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
    <Card className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <OrderHeader order={order} expanded={expanded} onClick={onToggle} />
      <div
        className={[
          "overflow-hidden transition-all duration-300",
          expanded ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
      >
        <OrderDetails order={order} />
      </div>
    </Card>
  );
};
