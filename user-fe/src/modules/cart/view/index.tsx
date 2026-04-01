import { useCart } from "../hooks/useCart";
import { EmptyCart } from "../components/emptyCart";
import { CartList } from "../components/cartList";
import { CartSummary } from "../components/cartSummary";
export const initialCartItems = [
  {
    id: "1",
    name: "Áo thun basic",
    image: "https://via.placeholder.com/100",
    variant: "Size M",
    price: 120000,
    quantity: 1,
    shopId: "shop1",
    shopName: "Shop A",
  },
  {
    id: "2",
    name: "Quần jeans",
    image: "https://via.placeholder.com/100",
    variant: "Size L",
    price: 300000,
    quantity: 2,
    shopId: "shop1",
    shopName: "Shop A",
  },
  {
    id: "3",
    name: "Giày sneaker",
    image: "https://via.placeholder.com/100",
    variant: "42",
    price: 500000,
    quantity: 1,
    shopId: "shop2",
    shopName: "Shop B",
  },
];
export default function CartPage() {
  const cart = useCart(initialCartItems);

  if (cart.items.length === 0) return <EmptyCart />;

  const grouped = cart.items.reduce((acc: any, item: any) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-6">
      
      <div className="lg:col-span-2">
        <CartList
          grouped={grouped}
          selected={cart.selected.map(String)}
          onSelect={(id: string) => cart.toggleItem(Number(id))}
          onQty={(id: string, value: number) => cart.updateQty(Number(id), value)}
          onRemove={(id: string) => cart.remove(Number(id))}
        />
      </div>

      <CartSummary
        subtotal={cart.subtotal}
        disabled={cart.selected.length === 0}
      />

    </div>
  );
}