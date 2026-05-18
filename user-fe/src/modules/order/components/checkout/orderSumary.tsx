interface Props {
  items: Array<{
    id?: number | string;
    name?: string;
    image?: string;
    variantName?: string | null;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  total: number;
  tax?: number;
  shipping?: number;
  discount?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const OrderSummary: React.FC<Props> = ({
  items,
  total,
  subtotal,
  tax,
  shipping,
  discount,
}) => {
  return (
    <aside className="sticky top-24 overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-lg font-semibold text-slate-950">
          Tóm tắt thanh toán
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Rà soát nhanh sản phẩm và tổng hóa đơn trước khi xác nhận.
        </p>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto px-6 py-5">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="flex gap-3 rounded-2xl bg-slate-50 p-3"
          >
            <img
              src={item.image || "/placeholder.png"}
              className="size-14 rounded-2xl object-cover ring-1 ring-slate-200"
            />

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-medium text-slate-900">
                {item.name || "Sản phẩm"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {item.variantName || "Mặc định"}
              </p>

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  x{item.quantity}
                </span>

                <span className="font-semibold text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-slate-100 px-6 py-5 text-sm">

        <div className="flex items-center justify-between text-slate-500">
          <span>Tạm tính</span>

          <span className="font-medium text-slate-900">
            {formatCurrency(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-500">
          <span>Phí vận chuyển</span>

          <span className="font-medium text-slate-900">
            {formatCurrency(shipping || 0)}
          </span>
        </div>

        {tax && tax > 0 ? (
          <div className="flex items-center justify-between text-slate-500">
            <span>VAT (10%)</span>

            <span className="font-medium text-slate-900">
              {formatCurrency(tax)}
            </span>
          </div>
        ) : null}

        {discount && discount > 0 && (
          <div className="flex items-center justify-between text-green-600">
            <span>Giảm giá</span>

            <span className="font-medium">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">
              Tổng thanh toán
            </span>

            <span className="text-xl font-semibold text-[#ee4d2d]">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
