import type { IOrderItem } from "../types";

interface OrderItemListProps {
  items: IOrderItem[];
}

export const OrderItemList: React.FC<OrderItemListProps> = ({ items }) => {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3">
          {/* image */}
          <img
            src={item.product_image ?? ""}
            alt={item.product_name}
            className="w-12 h-12 object-cover rounded"
          />

          {/* info */}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {item.product_name}
            </p>

            {item.variant_name && (
              <p className="text-xs text-muted">
                {item.variant_name}
              </p>
            )}
          </div>

          {/* quantity + price */}
          <div className="text-right text-sm">
            <p>x{item.quantity}</p>
            <p className="font-semibold">
              {item.price.toLocaleString()}đ
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};