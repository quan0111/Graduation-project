// ShippingInfo.tsx
import { Truck, Shield, RotateCcw } from "lucide-react";

export const ShippingInfo = () => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex gap-2"><Truck /> Free ship</div>
      <div className="flex gap-2"><Shield /> Bảo hành</div>
      <div className="flex gap-2"><RotateCcw /> Đổi trả</div>
    </div>
  );
};