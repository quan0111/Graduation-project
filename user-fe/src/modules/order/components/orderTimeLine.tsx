// OrderTimeline.tsx
import { CheckCircle, Truck, Package } from "lucide-react";

export const OrderTimeline = ({ status }) => {
  const steps = [
    { label: "Xác nhận", icon: CheckCircle },
    { label: "Đóng gói", icon: Package },
    { label: "Giao hàng", icon: Truck },
  ];

  return (
    <div className="flex justify-between">
      {steps.map((s, i) => {
        const Icon = s.icon;

        return (
          <div key={i} className="flex flex-col items-center">
            <Icon className="text-green-500" />
            <p className="text-xs">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
};