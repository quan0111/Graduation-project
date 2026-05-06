'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";
import { toast } from "sonner";

export const ProductActions = ({
  productId,
  variantId,
  shopId,
  stock,
}: any) => {
  const [qty, setQty] = useState(1);
  const addMutation = useAddItem();

  const handleAddToCart = async () => {
    if (!shopId) {
      toast.error("Thiếu shopId");
      return;
    }

    if (stock === 0) {
      toast.error("Hết hàng");
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId,
        variantId,
        shopId, 
        quantity: qty,
      });

      toast.success("Đã thêm vào giỏ");
    } catch {
      toast.error("Thêm thất bại");
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <span className="px-4">{qty}</span>
        <button onClick={() => setQty(qty + 1)}>+</button>
      </div>

      <Button onClick={handleAddToCart}>
        {addMutation.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
      </Button>
    </div>
  );
};