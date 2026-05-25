import { API_URL_CART } from "@/constant/config";
import { apiClient } from "@/lib/api";

export type GuestCartItem = {
  productId: number;
  variantId?: number | null;
  shopId: number;
  quantity: number;
  availableStock?: number | null;
};

export type GuestCartMergeResult = {
  successCount: number;
  removedCount: number;
  failedCount: number;
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

const persistGuestCart = (items: GuestCartItem[]) => {
  if (typeof window === "undefined") return;
  if (!items.length) {
    clearGuestCart();
    return;
  }
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

export const addGuestCartItem = (item: GuestCartItem) => {
  if (!item.variantId || item.quantity <= 0) {
    return false;
  }
  if (item.availableStock !== null && item.availableStock !== undefined && item.availableStock <= 0) {
    return false;
  }

  const current = readGuestCart();
  const index = current.findIndex((entry) => sameItem(entry, item));
  if (index >= 0) {
    const nextQuantity = current[index].quantity + item.quantity;
    current[index] = {
      ...current[index],
      availableStock: item.availableStock ?? current[index].availableStock ?? null,
      quantity:
        item.availableStock !== null && item.availableStock !== undefined
          ? Math.min(nextQuantity, item.availableStock)
          : nextQuantity,
    };
  } else {
    current.push(item);
  }
  persistGuestCart(current);
  return true;
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_KEY);
};

const isValidationFailure = (reason: any) => {
  const status = reason?.response?.status;
  return status >= 400 && status < 500;
};

export const mergeGuestCartToAccount = async (): Promise<GuestCartMergeResult> => {
  const items = readGuestCart();
  if (!items.length) return { successCount: 0, removedCount: 0, failedCount: 0 };

  const results = await Promise.allSettled(
    items.map((item) =>
      apiClient.post(`${API_URL_CART}/items`, {
        productId: item.productId,
        variantId: item.variantId,
        shopId: item.shopId,
        quantity: item.quantity,
      }),
    ),
  );
  const successCount = results.filter((result) => result.status === "fulfilled").length;
  const remainingItems = results
    .map((result, index) => ({ result, item: items[index] }))
    .filter(({ result }) => result.status === "rejected" && !isValidationFailure((result as PromiseRejectedResult).reason))
    .map(({ item }) => item);
  const failedCount = results.length - successCount;
  const removedCount = failedCount - remainingItems.length;

  persistGuestCart(remainingItems);

  return { successCount, removedCount, failedCount: remainingItems.length };
};
