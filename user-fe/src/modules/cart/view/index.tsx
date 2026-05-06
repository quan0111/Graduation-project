'use client';

import { useState, useRef, useMemo } from "react";
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
  const debounceRef = useRef<Record<string, any>>({});

  const cartItems = cartData?.items || [];

  /* ================= FIX MAPPING ================= */
  const transformedItems = useMemo(() => {
    return cartItems.map((item: any) => {
      const productId = item.product?.id ?? item.productId ?? 0;
      const variantId = item.variant?.id ?? item.variantId ?? null;

      // 🔥 FIX CHUẨN THEO DATA CỦA BẠN
      const shopId = item.shop?.id ?? item.shopId ?? 0;
      const shopName = item.shop?.name ?? "Shop";

      if (!productId || !shopId) {
        console.warn("⚠️ ITEM LỖI", item);
      }

      return {
        id: String(item.id),

        productId,
        variantId,
        shopId,

        name: item.product?.name || "Sản phẩm",
        image: item.product?.images?.[0]?.url || "",
        variant: item.variant?.name,
        price: item.variant?.price || item.product?.price || 0,
        quantity: item.quantity,

        shopName,
      };
    });
  }, [cartItems]);

  /* ================= GROUP THEO SHOP ================= */
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};

    transformedItems.forEach((item) => {
      if (!map[item.shopId]) {
        map[item.shopId] = [];
      }
      map[item.shopId].push(item);
    });

    return map;
  }, [transformedItems]);

  /* ================= SELECT ================= */
  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  /* ================= UPDATE ================= */
  const handleUpdateQty = (id: string, quantity: number) => {
    const itemId = Number(id);

    if (debounceRef.current[id]) {
      clearTimeout(debounceRef.current[id]);
    }

    debounceRef.current[id] = setTimeout(() => {
      updateMutation.mutate({
        itemId,
        quantity,
      });
    }, 400);
  };

  /* ================= DELETE ================= */
  const handleRemove = async (id: string) => {
    await deleteMutation.mutateAsync(Number(id));
  };

  /* ================= CLEAR ================= */
  const handleClear = async () => {
    if (!cartData?.id) return;
    await clearMutation.mutateAsync(cartData.id);
  };

  /* ================= CHECKOUT ================= */
  const handleCheckout = () => {
    const selectedItems = transformedItems
      .filter((item) => selected.includes(item.id))
      .map((item) => ({
        productId: Number(item.productId),
        variantId: item.variantId || null,
        shopId: Number(item.shopId),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

    const invalid = selectedItems.filter(
      (i) => !i.productId || !i.shopId
    );

    if (invalid.length) {
      console.error("❌ ITEM LỖI", invalid);
      alert("Có sản phẩm lỗi (thiếu productId/shopId)");
      return;
    }

    navigate("/checkout", {
      state: {
        items: selectedItems,
      },
    });
  };

  /* ================= CALC ================= */
  const selectedItems = transformedItems.filter((i) =>
    selected.includes(i.id)
  );

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* ================= UI ================= */

  if (isLoading) return <div>Loading cart...</div>;

  if (!transformedItems.length) return <EmptyCart />;

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <CartList
          grouped={grouped}            // 🔥 group theo shop
          selected={selected}
          onSelect={handleSelect}
          onQty={handleUpdateQty}
          onRemove={handleRemove}
        />

        <button
          onClick={handleClear}
          className="mt-4 text-red-500 hover:underline"
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