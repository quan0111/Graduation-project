import { API_URL_CART } from "@/constant/config";
import { apiClient } from "@/lib/api";

export type GuestCartItem = {
  productId: number;
  variantId?: number | null;
  shopId: number;
  quantity: number;
};

const GUEST_CART_KEY = "markethub.guest_cart";

const sameItem = (a: GuestCartItem, b: GuestCartItem) =>
  a.productId === b.productId &&
  (a.variantId ?? null) === (b.variantId ?? null) &&
  a.shopId === b.shopId;

export const readGuestCart = (): GuestCartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addGuestCartItem = (item: GuestCartItem) => {
  const current = readGuestCart();
  const index = current.findIndex((entry) => sameItem(entry, item));
  if (index >= 0) {
    current[index] = {
      ...current[index],
      quantity: current[index].quantity + item.quantity,
    };
  } else {
    current.push(item);
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(current));
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
};

export const mergeGuestCartToAccount = async () => {
  const items = readGuestCart();
  if (!items.length) return 0;

  const results = await Promise.allSettled(
    items.map((item) => apiClient.post(`${API_URL_CART}/items`, item)),
  );
  const successCount = results.filter((result) => result.status === "fulfilled").length;
  if (successCount === items.length) {
    clearGuestCart();
  }
  return successCount;
};
