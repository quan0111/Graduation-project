// components/Action.tsx

'use client';

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

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
    <div className="space-y-8">

      {/* QTY */}
      <div className="flex items-center gap-8">

        <span className="text-[#757575] w-24">
          Số Lượng
        </span>

        <div className="flex items-center border">

          <button
            className="w-8 h-8 flex items-center justify-center border-r"
            onClick={() =>
              setQty(Math.max(1, qty - 1))
            }
          >
            <Minus size={16} />
          </button>

          <div className="w-12 text-center">
            {qty}
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center border-l"
            onClick={() => setQty(qty + 1)}
          >
            <Plus size={16} />
          </button>

        </div>

        <span className="text-sm text-[#757575]">
          {stock} sản phẩm có sẵn
        </span>

      </div>

      {/* BUTTON */}
      <div className="flex gap-4">

        <Button
          onClick={handleAddToCart}
          className="h-12 px-8 bg-[#ffeee8] hover:bg-[#ffe2d5] text-[#ee4d2d] border border-[#ee4d2d]"
          variant="outline"
        >
          <ShoppingCart size={18} />
          Thêm Vào Giỏ Hàng
        </Button>

        <Button className="h-12 px-10 bg-[#ee4d2d] hover:bg-[#d73211] text-white">
          Mua Ngay
        </Button>

      </div>

    </div>
  );
};