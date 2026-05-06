// src/modules/order/components/orderItems.tsx

import type { IOrderItem } from "../types";

interface OrderItemsProps {
  items: IOrderItem[];
}

export const OrderItems: React.FC<OrderItemsProps> = ({
  items,
}) => {
  return (
    <div className="space-y-4">
      {items.map((i) => {
        // Extract product info from nested Product and variant objects
        const productName = i.Product?.name;
        // Get the first image URL or use placeholder
        const productImage = i.Product?.images?.[0]?.url;
        const variantName = i.variant?.name;

        return (
          <div
            key={i.id}
            className="flex gap-4 p-4 rounded-xl border hover:bg-muted/40 transition"
          >
            {/* IMAGE */}
            <img
              src={productImage || "/placeholder.png"}
              alt={productName || "Product"}
              className="w-20 h-20 rounded-lg object-cover border"
            />

            {/* CONTENT */}
            <div className="flex-1">
              {/* NAME */}
              <p className="font-semibold text-base">
                {productName || "Unknown Product"}
              </p>

              {/* VARIANT */}
              <p className="text-sm text-muted-foreground mt-1">
                {variantName || "Không có phân loại"}
              </p>

              {/* BOTTOM */}
              <div className="flex items-end justify-between mt-3">
                <span className="text-sm">
                  Số lượng:{" "}
                  <span className="font-medium">
                    {i.quantity}
                  </span>
                </span>

                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {Number(i.price).toLocaleString("vi-VN")}đ
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Tổng:{" "}
                    {(
                      Number(i.price) * Number(i.quantity)
                    ).toLocaleString("vi-VN")}
                    đ
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
