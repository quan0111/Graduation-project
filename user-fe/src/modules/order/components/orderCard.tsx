// OrderCard.tsx
import { OrderHeader } from "./OrderHeader";
import { OrderDetails } from "./OrderDetails";
import { Card } from "@/components/ui/card";

export const OrderCard = ({ order, expanded, onToggle }) => {
  return (
    <Card className="overflow-hidden transition hover:shadow-md">
      <OrderHeader order={order} onClick={onToggle} />

      {/* animate mở */}
      <div
        className={`
          transition-all duration-300 overflow-hidden
          ${expanded ? "max-h-[1000px]" : "max-h-0"}
        `}
      >
        <OrderDetails order={order} />
      </div>
    </Card>
  );
};