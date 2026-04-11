import { useGetCart } from "../api/get-cart";
import { useDeleteCartItem } from "../api/delete-cart";
import { useUpdateCart } from "../api/update-cart";
import { EmptyCart } from "../components/emptyCart";
import { CartList } from "../components/cartList";
import { CartSummary } from "../components/cartSummary";
import type { ICartItem } from "../types";

// Type for transformed cart item that matches component expectations
type TransformedCartItem = {
  id: string;
  name: string;
  image: string;
  variant?: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
};

/* ---------- PAGE ---------- */

export default function CartPage() {
  const { data: cartData, isLoading, refetch } = useGetCart();
  const deleteMutation = useDeleteCartItem();
  const updateMutation = useUpdateCart();

  // Transform API data - handle both array and single cart object
  const cartItems: ICartItem[] = cartData?.data?.data?.[0]?.items || 
                                  cartData?.data?.items || 
                                  [];

  // Transform cart items to match the component's expected format
  const transformedItems: TransformedCartItem[] = cartItems.map((item) => ({
    id: String(item.id),
    name: item.product?.name || "Sản phẩm",
    image: item.product?.Images?.[0]?.url || "https://via.placeholder.com/100",
    variant: item.variant?.name || "Default",
    price: item.variant?.price || item.product?.price || 0,
    quantity: item.quantity,
    shopId: String(item.product?.shop_id || ""),
    shopName: item.product?.Shop?.name || "Shop",
  }));

  // Handle remove item
  const handleRemove = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  // Handle update quantity
  const handleUpdateQty = async (id: string, quantity: number) => {
    try {
      await updateMutation.mutateAsync({ id, data: { items: [{ quantity }] } });
      refetch();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  // Handle select item (for checkout)
  const handleSelect = (id: string) => {
    // Implement selection logic if needed
    console.log("Selected item:", id);
  };

  // Calculate totals
  const selectedItems = transformedItems; // All items selected by default
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Show empty cart if no items
  if (transformedItems.length === 0) {
    return <EmptyCart />;
  }

  // Group items by shop
  const grouped = transformedItems.reduce((acc: Record<string, TransformedCartItem[]>, item) => {
    if (!acc[item.shopId]) acc[item.shopId] = [];
    acc[item.shopId].push(item);
    return acc;
  }, {});

  return (
    <div className="grid lg:grid-cols-3 gap-6 p-6">
      <div className="lg:col-span-2">
        <CartList
          grouped={grouped}
          selected={selectedItems.map((item) => item.id)}
          onSelect={handleSelect}
          onQty={handleUpdateQty}
          onRemove={handleRemove}
          isLoading={deleteMutation.isPending || updateMutation.isPending}
        />
      </div>

      <CartSummary
        subtotal={subtotal}
        disabled={selectedItems.length === 0}
      />
    </div>
  );
}