import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../api/get-cart";
import { useDeleteCartItem } from "../api/delete-cart";
import { useUpdateItem } from "../api/update-cart";
import { useClearCart } from "../api/clear-cart";

import { EmptyCart } from "../components/emptyCart";
import { CartList } from "../components/cartList";
import { CartSummary } from "../components/cartSummary";

export default function CartPage() {
  const navigate = useNavigate();

  const { data: cartData, isLoading } = useCart();
  const deleteMutation = useDeleteCartItem();
  const updateMutation = useUpdateItem();
  const clearMutation = useClearCart();

  const [selected, setSelected] = useState<string[]>([]);

  const cartItems = cartData?.items || [];

  const transformedItems = cartItems.map((item: any) => ({
    id: String(item.id),
    name: item.product?.name || "Sản phẩm",
    image: item.product?.Images?.[0]?.url || "",
    variant: item.variant?.name,
    price: item.variant?.price || item.product?.price || 0,
    quantity: item.quantity,
    shopId: String(item.product?.shop_id || ""),
    shopName: item.product?.Shop?.name || "Shop",
  }));

  // SELECT
  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  // UPDATE
  const handleUpdateQty = async (id: string, quantity: number) => {
    await updateMutation.mutateAsync({
      item_id: Number(id),
      quantity,
    });
  };

  // DELETE
  const handleRemove = async (id: string) => {
    await deleteMutation.mutateAsync(Number(id));
  };

  // CLEAR
  const handleClear = async () => {
    await clearMutation.mutateAsync(cartData?.id as number);
  };

  // CHECKOUT
  const handleCheckout = () => {
    const selectedItems = transformedItems.filter((item) =>
      selected.includes(item.id)
    );

    navigate("/checkout", {
      state: {
        items: selectedItems,
      },
    });
  };

  const selectedItems = transformedItems.filter((i) =>
    selected.includes(i.id)
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (isLoading) return <div>Loading...</div>;
  if (!transformedItems.length) return <EmptyCart />;

  const grouped = transformedItems.reduce((acc: any, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <CartList
          grouped={grouped}
          selected={selected}
          onSelect={handleSelect}
          onQty={handleUpdateQty}
          onRemove={handleRemove}
        />

        <button
          onClick={handleClear}
          className="mt-4 text-red-500"
        >
          Xóa toàn bộ
        </button>
      </div>

      <CartSummary
        subtotal={subtotal}
        disabled={!selected.length}
        onCheckout={handleCheckout}
      />
    </div>
  );
}