import { CheckCircle, Truck, Package } from "lucide-react";
import type { OrderStatusType } from "../types";

interface OrderTimelineProps {
  status: OrderStatusType;
}

const steps = [
  {
    key: "CONFIRMED",
    label: "Xác nhận",
    icon: CheckCircle,
  },
  {
    key: "PROCESSING",
    label: "Đóng gói",
    icon: Package,
  },
  {
    key: "SHIPPED",
    label: "Giao hàng",
    icon: Truck,
  },
] as const;

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
}) => {
  // xác định step hiện tại
  const currentStepIndex = steps.findIndex(
    (s) => s.key === status
  );

  return (
<div className="flex items-center">
  {steps.map((s, i) => {
    const Icon = s.icon;
    const isActive = i <= currentStepIndex;

    return (
      <div key={s.key} className="flex items-center flex-1">
        <div className="flex flex-col items-center">
          <Icon
            className={`w-6 h-6 ${
              isActive ? "text-green-500" : "text-muted"
            }`}
          />
          <p className="text-xs mt-1">{s.label}</p>
        </div>

        {i < steps.length - 1 && (
          <div
            className={`flex-1 h-[2px] mx-2 ${
              i < currentStepIndex
                ? "bg-green-500"
                : "bg-muted"
            }`}
          />
        )}
      </div>
    );
  })}
</div>
  );
};