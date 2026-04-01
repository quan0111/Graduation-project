// sections/CartSummary.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type CartSummaryProps = {
  subtotal: number;
  disabled?: boolean;
};

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  disabled = false,
}) => {
  return (
    <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between mb-4">
        <span>Tổng</span>
        <span className="text-red-500 font-bold">
          {subtotal.toLocaleString("vi-VN")}đ
        </span>
      </div>

      <Link to="/checkout">
        <Button disabled={disabled} className="w-full bg-red-500">
          Mua hàng
        </Button>
      </Link>
    </div>
  );
};