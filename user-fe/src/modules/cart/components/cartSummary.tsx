// sections/CartSummary.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const CartSummary = ({ subtotal, disabled }) => {
  return (
    <div className="sticky top-24 bg-white p-4 rounded-lg shadow-sm">

      <div className="flex justify-between mb-4">
        <span>Tổng</span>
        <span className="text-red-500 font-bold">
          {subtotal.toLocaleString()}đ
        </span>
      </div>

      <Link href="/checkout">
        <Button disabled={disabled} className="w-full bg-red-500">
          Mua hàng
        </Button>
      </Link>

    </div>
  );
};