// ProductActions.tsx
'use client';
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const ProductActions = ({ stock }: { stock: number }) => {
  const [qty, setQty] = useState(1);

  return (
    <div>
      <div className="flex mb-3">
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <span className="px-4">{qty}</span>
        <button onClick={() => setQty(qty + 1)}>+</button>
      </div>

      <Button disabled={stock === 0} className="w-full">
        {stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
      </Button>
    </div>
  );
};