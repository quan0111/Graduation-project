'use client';

import { useMemo, useRef, useState, type ReactNode } from "react";
import { ShoppingCart, Sparkles, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import { useMyCart } from "../api/get-my-cart";
import { useClearCart } from "../api/clear-cart";
import { useDeleteCartItem } from "../api/delete-cart";
import { useUpdateItem } from "../api/update-cart";
import { CartList } from "../components/cartList";
import { CartSummary } from "../components/cartSummary";
import { EmptyCart } from "../components/emptyCart";

export default function CartPage() {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useMyCart();
  const deleteMutation = useDeleteCartItem();
  const updateMutation = useUpdateItem();
  const clearMutation = useClearCart();

  const [selected, setSelected] = useState<string[]>([]);
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const cartItems = cartData?.items || [];

  const transformedItems = useMemo(() => {
    return cartItems.map((item: any) => {
      const productId = item.product?.id ?? item.productId ?? 0;
      const variantId = item.variant?.id ?? item.variantId ?? null;
      const shopId = item.shop?.id ?? item.shopId ?? 0;
      const shopName = item.shop?.name ?? "Shop";

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

  const grouped = useMemo(() => {
    const map: Record<string, typeof transformedItems> = {};

    transformedItems.forEach((item) => {
      if (!map[item.shopId]) {
        map[item.shopId] = [];
      }
      map[item.shopId].push(item);
    });

    return map;
  }, [transformedItems]);

  const handleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const handleUpdateQty = (id: string, quantity: number) => {
    const itemId = Number(id);

    if (debounceRef.current[id]) {
      clearTimeout(debounceRef.current[id]);
    }

    debounceRef.current[id] = setTimeout(() => {
      updateMutation.mutate({ itemId, quantity });
    }, 350);
  };

  const handleRemove = async (id: string) => {
    await deleteMutation.mutateAsync(Number(id));
    setSelected((prev) => prev.filter((value) => value !== id));
  };

  const handleClear = async () => {
    if (!cartData?.id) return;
    await clearMutation.mutateAsync(cartData.id);
    setSelected([]);
  };

  const handleCheckout = () => {
    const selectedItems = transformedItems
      .filter((item) => selected.includes(item.id))
      .map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        variantName: item.variant,
        productId: Number(item.productId),
        variantId: item.variantId || null,
        shopId: Number(item.shopId),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

    if (!selectedItems.length) {
      return;
    }

    navigate("/checkout", {
      state: {
        items: selectedItems,
      },
    });
  };

  const selectedItems = transformedItems.filter((item) => selected.includes(item.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-500">Đang tải giỏ hàng...</div>;
  }

  if (!transformedItems.length) {
    return <EmptyCart />;
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-8">
        <section className="rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(238,77,45,0.18),_transparent_36%),linear-gradient(135deg,#111827,#1f2937)] px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 text-orange-200">
                <ShoppingCart className="size-5" />
                <span className="text-sm uppercase tracking-[0.24em]">Giỏ hàng</span>
              </div>
              <h1 className="mt-3 text-3xl font-semibold">Sẵn sàng cho checkout gọn hơn</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Chọn sản phẩm theo từng shop, rà nhanh tổng tiền và chuyển thẳng sang checkout mà không bị rối thông tin.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPill label="Đã chọn" value={`${selectedItems.length} sản phẩm`} />
              <InfoPill label="Shop" value={`${Object.keys(grouped).length} cửa hàng`} icon={<Sparkles className="size-4" />} />
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_360px]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/80">
              <div>
                <p className="text-sm font-semibold text-slate-950">Danh sách sản phẩm</p>
                <p className="text-sm text-slate-500">Các sản phẩm được nhóm theo shop để dễ kiểm tra trước khi thanh toán.</p>
              </div>

              <Button
                variant="outline"
                onClick={handleClear}
                className="rounded-full"
                disabled={clearMutation.isPending}
              >
                <Trash2 className="size-4" />
                Xóa toàn bộ
              </Button>
            </div>

            <CartList
              grouped={grouped}
              selected={selected}
              onSelect={handleSelect}
              onQty={handleUpdateQty}
              onRemove={handleRemove}
            />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <CartSummary
              subtotal={subtotal}
              selectedCount={selectedItems.length}
              disabled={!selectedItems.length}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.22em] text-orange-200">{label}</p>
      <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-white">
        {icon}
        {value}
      </div>
    </div>
  );
}
