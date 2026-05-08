import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { IOrder } from "../types";
import { formatCurrency } from "../utils/order";

interface OrderSummaryProps {
  order: IOrder;
  sellerView?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  sellerView = false,
}) => {

  /* =========================
   * SUBTOTAL
   * ========================= */

  const visibleSubtotal = order.items.reduce(
    (sum, item) => sum + item.line_total,
    0
  );

  /* =========================
   * VAT
   * total = subtotal + ship + vat - discount
   * => vat = total - subtotal - ship + discount
   * ========================= */

  const vatAmount = sellerView
    ? 0
    : Math.max(
        order.total_amount -
          visibleSubtotal -
          order.shipping_fee +
          order.discount_amount,
        0
      );

  return (
    <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/80">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-base">
          {sellerView
            ? "Giá trị đơn theo shop"
            : "Tổng hợp thanh toán"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* subtotal */}
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Tạm tính sản phẩm</span>

          <span className="font-medium text-slate-900">
            {formatCurrency(visibleSubtotal)}
          </span>
        </div>

        {!sellerView && (
          <>

            {/* shipping */}
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Phí vận chuyển</span>

              <span className="font-medium text-slate-900">
                {formatCurrency(order.shipping_fee)}
              </span>
            </div>

            {/* VAT */}
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>VAT (10%)</span>

              <span className="font-medium text-slate-900">
                {formatCurrency(vatAmount)}
              </span>
            </div>

            {/* discount */}
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Giảm giá</span>

              <span className="font-medium text-slate-900">
                {order.discount_amount > 0
                  ? `- ${formatCurrency(order.discount_amount)}`
                  : "0 ₫"}
              </span>
            </div>

            {/* total */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Khách thanh toán
                </span>

                <span className="text-xl font-semibold text-[#ee4d2d]">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </>
        )}

        {sellerView && (
          <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-slate-600">
            Đơn nhiều shop không có phân bổ phí ship và giảm giá
            theo từng shop trong schema hiện tại. Giá trị bên trên
            chỉ phản ánh các sản phẩm thuộc shop của bạn.
          </div>
        )}
      </CardContent>
    </Card>
  );
};