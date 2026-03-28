// sections/OrderShipping.tsx
import { Card } from "@/components/ui/card";
import { MapPin, Truck } from "lucide-react";

export const OrderShipping = ({ order }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">

      <Card className="p-4">
        <MapPin />
        <p className="font-semibold">{order.shippingAddress.name}</p>
        <p className="text-sm text-muted">{order.shippingAddress.address}</p>
      </Card>

      <Card className="p-4">
        <Truck />
        <p>{order.shippingMethod}</p>
        <p className="font-mono">{order.trackingNumber}</p>
      </Card>

    </div>
  );
};