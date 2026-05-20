import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddItem } from "@/modules/cart/api/add-item";
import { getStoredStorefrontUser } from "@/lib/auth-storage";
import { addGuestCartItem } from "@/lib/guest-cart";

interface ProductActionsProps {
  productId: number;
  variantId: number | null;
  shopId: number | null;
  stock: number;
  onAddedToCart?: (quantity: number) => void;
}

export const ProductActions = ({ productId, variantId, shopId, stock, onAddedToCart }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const addMutation = useAddItem();
  const navigate = useNavigate();
  const isOutOfStock = stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng");
      return;
    }

    if (!getStoredStorefrontUser() && shopId) {
      addGuestCartItem({
        productId,
        variantId,
        shopId,
        quantity,
      });
      toast.success("Đã lưu sản phẩm, đăng nhập để đồng bộ giỏ hàng");
      navigate("/login", { state: { redirect: window.location.pathname } });
      return;
    }

    const user = getStoredStorefrontUser();
    if (!user) {
      toast.error("Bạn cần đăng nhập để thêm vào giỏ hàng");
      navigate("/login", { state: { redirect: window.location.pathname } });
      return;
    }

    if (!shopId) {
      toast.error("Sản phẩm chưa có thông tin shop");
      return;
    }

    try {
      await addMutation.mutateAsync({
        productId,
        variantId,
        shopId,
        quantity,
      });
      onAddedToCart?.(quantity);
      toast.success("Đã thêm vào giỏ hàng");
    } catch {
      toast.error("Không thể thêm sản phẩm");
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (getStoredStorefrontUser()) {
      navigate("/cart");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-24 text-sm text-slate-500">Số lượng</span>

        <div className="flex items-center overflow-hidden rounded-lg border border-orange-200">
          <button
            className="h-9 w-9 border-r border-orange-200 text-slate-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            type="button"
          >
            <Minus size={16} className="mx-auto" />
          </button>

          <div className="w-12 text-center text-sm font-medium text-slate-900">{quantity}</div>

          <button
            className="h-9 w-9 border-l border-orange-200 text-slate-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            disabled={isOutOfStock || quantity >= stock}
            type="button"
          >
            <Plus size={16} className="mx-auto" />
          </button>
        </div>

        <span className="text-sm text-slate-500">{stock} sản phẩm có sẵn</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleAddToCart}
          className="h-11 gap-2 rounded-xl border border-orange-500 bg-orange-50 px-6 text-orange-600 hover:bg-orange-100"
          variant="outline"
          disabled={addMutation.isPending || isOutOfStock}
        >
          <ShoppingCart size={18} />
          {addMutation.isPending ? "Đang thêm..." : "Thêm vào giỏ hàng"}
        </Button>

        <Button
          onClick={handleBuyNow}
          className="h-11 rounded-xl bg-orange-600 px-8 text-white hover:bg-orange-700"
          disabled={addMutation.isPending || isOutOfStock}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
};
