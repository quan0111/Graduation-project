import { Card } from "@/components/ui/card";
import { MapPin, Truck } from "lucide-react";
import type { IOrder } from "../types";

interface OrderShippingProps {
  order: IOrder;
}

export const OrderShipping: React.FC<OrderShippingProps> = ({
  order,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Address */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <p className="font-semibold">Địa chỉ giao hàng</p>
        </div>

        <p className="text-sm text-muted">
          {order.shipping_address_id
            ? `Address ID: ${order.shipping_address_id}`
            : "Chưa có địa chỉ"}
        </p>
      </Card>

      {/* Shipping info */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <p className="font-semibold">Vận chuyển</p>
        </div>

        <p className="text-sm text-muted">
          Chưa có thông tin vận chuyển
        </p>
      </Card>
    </div>
  );
};