import type { IOrderItem } from "../types";

interface OrderItemsProps {
  items: IOrderItem[];
}

export const OrderItems: React.FC<OrderItemsProps> = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div
          key={i.id}
          className="flex gap-4 p-3 rounded-lg hover:bg-muted transition"
        >
          {/* image */}
          <img
            src={i.product_image ?? "/placeholder.png"}
            alt={i.product_name}
            className="w-16 h-16 rounded object-cover"
          />

          {/* content */}
          <div className="flex-1">
            <p className="font-medium">{i.product_name}</p>

            {/* variant hoặc shop */}
            <p className="text-sm text-muted">
              {i.variant_name ??
                i.Product?.name ??
                "—"}
            </p>

            {/* quantity + price */}
            <div className="flex justify-between mt-2">
              <span>SL: {i.quantity}</span>

              <div className="text-right">
                <p className="text-primary font-semibold">
                  {i.price.toLocaleString("vi-VN")}đ
                </p>

                <p className="text-xs text-muted">
                  {(i.price * i.quantity).toLocaleString("vi-VN")}đ
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};