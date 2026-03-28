// sections/OrderSummary.tsx
import { Separator } from "@/components/ui/separator";

export const OrderSummary = ({ order }) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span>Tạm tính</span>
        <span>{order.subtotal.toLocaleString()}đ</span>
      </div>

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Tổng</span>
        <span className="text-primary">
          {order.total.toLocaleString()}đ
        </span>
      </div>
    </div>
  );
};