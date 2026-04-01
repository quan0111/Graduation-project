import type { IOrderItem } from "../../types";

interface OrderSummaryProps {
  items: IOrderItem[];
  subtotal: number;
  total: number;
  tax?: number;
  shipping?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  total,
  subtotal,
  tax,
  shipping,
}) => {
  return (
    <div className="sticky top-20 space-y-4">
      {/* items */}
      <div className="max-h-60 overflow-y-auto">
        {items.map((i) => (
          <div key={i.id} className="flex gap-2 mb-3">
            <img
              src={i.product_image ?? ""}
              className="w-12 h-12 object-cover"
              alt={i.product_name}
            />
            <div>
              <p className="text-sm">{i.product_name}</p>
              <p className="text-xs">x{i.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* total */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{subtotal}</span>
        </div>

        {shipping !== undefined && (
          <div className="flex justify-between">
            <span>Phí ship</span>
            <span>{shipping}</span>
          </div>
        )}

        {tax !== undefined && (
          <div className="flex justify-between">
            <span>Thuế</span>
            <span>{tax}</span>
          </div>
        )}

        <div className="flex justify-between font-bold">
          <span>Tổng</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  );
};