'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";
import { toast } from "sonner";

type Props = {
  productId: number;
  variantId?: number | null;
  stock: number;
};

export const ProductActions = ({
  productId,
  variantId,
  stock,
}: Props) => {
  const [qty, setQty] = useState(1);
  const addMutation = useAddItem();

  const handleAddToCart = async () => {
    if (stock === 0) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId: productId,
        variantId: variantId,
        quantity: qty,
      });

      toast.success("Đã thêm vào giỏ hàng");
    } catch (err) {
      console.error(err);
      toast.error("Thêm vào giỏ thất bại");
    }
  };

  return (
    <div>
      <div className="flex mb-3">
        <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
        <span className="px-4">{qty}</span>
        <button onClick={() => setQty(qty + 1)}>+</button>
      </div>

      <Button
        disabled={stock === 0 || addMutation.isPending}
        className="w-full"
        onClick={handleAddToCart}
      >
        {stock === 0
          ? "Hết hàng"
          : addMutation.isPending
          ? "Đang thêm..."
          : "Thêm vào giỏ"}
      </Button>
    </div>
  );
};