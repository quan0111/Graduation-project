import React from "react";
import { Button } from "@/components/ui/button";

type CartSummaryProps = {
  subtotal: number;
  disabled?: boolean;
  onCheckout?: () => void;
};

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  disabled,
  onCheckout,
}) => {
  return (
    <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between mb-4">
        <span>Tổng</span>
        <span className="text-red-500 font-bold">
          {subtotal.toLocaleString("vi-VN")}đ
        </span>
      </div>

      <Button
        disabled={disabled}
        className="w-full bg-red-500"
        onClick={onCheckout}
      >
        Mua hàng
      </Button>
    </div>
  );
};