// page.tsx
import { useCart } from "@/hooks/useCart";
import { CartList } from "@/components/cart/sections/CartList";
import { CartSummary } from "@/components/cart/sections/CartSummary";
import { EmptyCart } from "@/components/cart/sections/EmptyCart";

export default function Page() {
  const cart = useCart(initialCartItems);

  if (cart.items.length === 0) return <EmptyCart />;

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-6">

      <div className="lg:col-span-2">
        <CartList {...cart} />
      </div>

      <CartSummary
        subtotal={cart.subtotal}
        disabled={cart.selected.length === 0}
      />

    </div>
  );
}