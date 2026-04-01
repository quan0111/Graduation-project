import { Separator } from "@/components/ui/separator";
import type { IOrder } from "../types";

interface OrderSummaryProps {
  order: IOrder;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
}) => {
  return (
    <div className="space-y-3">
      {/* Subtotal */}
      <div className="flex justify-between">
        <span>Tạm tính</span>
        <span>
          {order.subtotal.toLocaleString("vi-VN")}đ
        </span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between">
        <span>Phí vận chuyển</span>
        <span>
          {order.shipping_fee.toLocaleString("vi-VN")}đ
        </span>
      </div>

      {/* Discount */}
      {order.discount_amount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Giảm giá</span>
          <span>
            -{order.discount_amount.toLocaleString("vi-VN")}đ
          </span>
        </div>
      )}

      <Separator />

      {/* Total */}
      <div className="flex justify-between text-lg font-bold">
        <span>Tổng</span>
        <span className="text-primary">
          {order.total_amount.toLocaleString("vi-VN")}đ
        </span>
      </div>
    </div>
  );
};