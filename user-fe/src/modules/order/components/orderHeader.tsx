import { Badge } from "@/components/ui/badge";
import type { IOrder } from "../types";

interface OrderHeaderProps {
  order: IOrder;
  onClick?: () => void;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({
  order,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="p-6 cursor-pointer hover:bg-muted/40 transition"
    >
      <div className="grid md:grid-cols-5 gap-4 items-center">
        {/* Mã đơn */}
        <div>
          <p className="text-xs text-muted">Mã đơn</p>
          <p className="font-semibold">#{order.id}</p>
        </div>

        {/* Người mua (thay vendor) */}
        <div>
          {order.User?.full_name ?? "—"}
        </div>

        {/* Số sản phẩm */}
        <div>
          {order.Items?.length ?? 0} sản phẩm
        </div>

        {/* Tổng tiền */}
        <div className="text-primary font-bold">
          {order.total_amount.toLocaleString()}đ
        </div>

        {/* Status */}
        <Badge>{order.status}</Badge>
      </div>
    </div>
  );
};