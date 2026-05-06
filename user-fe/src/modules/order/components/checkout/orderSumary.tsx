import type { IOrderItem } from "../../types";

interface Props {
  items: any[];
  subtotal: number;
  total: number;
  tax?: number;
  shipping?: number;
}

export const OrderSummary: React.FC<Props> = ({
  items,
  total,
  subtotal,
  tax,
  shipping,
}) => {
  const format = (n: number) =>
    (n || 0).toLocaleString("vi-VN") + "đ";

  return (
    <div className="sticky top-20 space-y-4">

      <div className="max-h-60 overflow-y-auto">
        {items.map((i) => (
          <div key={i.id} className="flex gap-2 mb-3">

            {/* 🔥 FIX IMAGE */}
            <img
              src={i.image || "/placeholder.png"}
              className="w-12 h-12 object-cover rounded"
            />

            <div>
              {/* 🔥 FIX NAME */}
              <p className="text-sm">{i.name}</p>
              <p className="text-xs">x{i.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{format(subtotal)}</span>
        </div>

        {shipping !== undefined && (
          <div className="flex justify-between">
            <span>Phí ship</span>
            <span>{format(shipping)}</span>
          </div>
        )}

        {tax && (
          <div className="flex justify-between">
            <span>Thuế</span>
            <span>{format(tax)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-base">
          <span>Tổng</span>
          <span className="text-red-500">
            {format(total)}
          </span>
        </div>
      </div>
    </div>
  );
};