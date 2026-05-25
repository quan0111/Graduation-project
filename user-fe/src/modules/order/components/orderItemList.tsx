import type { IOrderItem } from "../types";
import { formatCurrency } from "../utils/order";

interface OrderItemListProps {
  items: IOrderItem[];
}

export const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          <img
            src={item.product_image || "/placeholder.png"}
            alt={item.product_name}
            className="size-12 rounded-2xl object-cover ring-1 ring-slate-200"
          />

          <div className="min-w-0 flex-1">
            <p className="whitespace-normal break-words text-sm font-medium text-slate-900">{item.product_name}</p>
            <p className="text-xs text-slate-500">{item.variant_name || "Mặc định"}</p>
          </div>

          <div className="text-right text-sm">
            <p>x{item.quantity}</p>
            <p className="font-semibold text-slate-900">{formatCurrency(item.line_total)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
