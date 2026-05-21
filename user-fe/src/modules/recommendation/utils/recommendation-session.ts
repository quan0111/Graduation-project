const SESSION_STORAGE_KEY = "market_session_id";
const SESSION_PRODUCTS_KEY = "market_session_product_ids";
const MAX_SESSION_PRODUCTS = 20;

const isBrowser = () => typeof window !== "undefined";

export const getRecommendationSessionId = () => {
  if (!isBrowser()) {
    return undefined;
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const randomId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const nextId = `sess_${randomId}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextId);
  return nextId;
};

export const getSessionProductIds = () => {
  if (!isBrowser()) {
    return [];
  }

  const rawValue = window.sessionStorage.getItem(SESSION_PRODUCTS_KEY);
  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((value) => Number(value))
    .filter((value, index, values) => Number.isFinite(value) && value > 0 && values.indexOf(value) === index)
    .slice(0, MAX_SESSION_PRODUCTS);
};

export const recordSessionProductId = (productId: number) => {
  if (!isBrowser() || !Number.isFinite(productId) || productId <= 0) {
    return [];
  }

  const nextIds = [productId, ...getSessionProductIds().filter((id) => id !== productId)].slice(0, MAX_SESSION_PRODUCTS);
  window.sessionStorage.setItem(SESSION_PRODUCTS_KEY, nextIds.join(","));
  return nextIds;
};
