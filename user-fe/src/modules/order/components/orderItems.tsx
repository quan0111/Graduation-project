import type { IOrderItem } from "../types";
import { formatCurrency } from "../utils/order";

interface OrderItemsProps {
  items: IOrderItem[];
}

export const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <img
            src={item.product_image || "/placeholder.png"}
            alt={item.product_name}
            className="size-20 rounded-2xl object-cover ring-1 ring-slate-200"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950">
                  {item.product_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.variant_name || "Mặc định"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                  Shop: {item.shop?.name || `#${item.shop_id}`}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-sm text-slate-500">
                  {formatCurrency(item.price)} x {item.quantity}
                </p>
                <p className="text-lg font-semibold text-slate-950">
                  {formatCurrency(item.line_total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
