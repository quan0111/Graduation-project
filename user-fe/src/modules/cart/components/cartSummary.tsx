import React from "react";
import { ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

type CartSummaryProps = {
  subtotal: number;
  selectedCount: number;
  disabled?: boolean;
  onCheckout?: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value || 0);

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  selectedCount,
  disabled,
  onCheckout,
}) => {
  return (
    <div className="sticky top-24 overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80">
      <div className="bg-[radial-gradient(circle_at_top_left,rgba(238,77,45,0.18),transparent_40%),linear-gradient(135deg,#111827,#1f2937)] p-6 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-orange-200">Tóm tắt giỏ hàng</p>
        <p className="mt-3 text-3xl font-semibold">{formatCurrency(subtotal)}</p>
        <p className="mt-2 text-sm text-slate-300">
          {selectedCount} sản phẩm đã chọn sẵn sàng cho bước thanh toán.
        </p>
      </div>

      <div className="space-y-4 p-6">
        <div className="space-y-3 rounded-3xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Tạm tính</span>
            <span className="font-semibold text-slate-950">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Vận chuyển</span>
            <span className="text-slate-500">Tính ở bước thanh toán</span>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600" />
            Thanh toán an toàn qua các phương thức đã cấu hình
          </div>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-[#ee4d2d]" />
            Phí ship và tracking được cập nhật sau khi tạo đơn
          </div>
        </div>

        <Button
          disabled={disabled}
          className="h-11 w-full bg-[#ee4d2d] text-white hover:bg-[#d93f21]"
          onClick={onCheckout}
        >
          Tiến hành thanh toán
        </Button>
      </div>
    </div>
  );
};
