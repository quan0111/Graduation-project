// OrderHeader.tsx
import { Badge } from "@/components/ui/badge";

export const OrderHeader = ({ order, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-6 cursor-pointer hover:bg-muted/40 transition"
    >
      <div className="grid md:grid-cols-5 gap-4">

        <div>
          <p className="text-xs text-muted">Mã đơn</p>
          <p className="font-semibold">{order.id}</p>
        </div>

        <div>{order.vendor}</div>

        <div>{order.items} sản phẩm</div>

        <div className="text-primary font-bold">
          {order.total.toLocaleString()}đ
        </div>

        <Badge>{order.status}</Badge>
      </div>
    </div>
  );
};