type StorefrontUser = {
  id: number | string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
};

export const STOREFRONT_ACCESS_TOKEN_KEY = "storefront_access_token";
export const STOREFRONT_USER_KEY = "storefront_user";
export const STOREFRONT_AUTH_PERSIST_KEY = "storefront-auth-storage";

export function getStorefrontAccessToken() {
  return localStorage.getItem(STOREFRONT_ACCESS_TOKEN_KEY);
}

export function setStorefrontAccessToken(token: string) {
  localStorage.setItem(STOREFRONT_ACCESS_TOKEN_KEY, token);
}

export function getStoredStorefrontUser<T = StorefrontUser>() {
  const raw = localStorage.getItem(STOREFRONT_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredStorefrontUser(user: StorefrontUser) {
  localStorage.setItem(STOREFRONT_USER_KEY, JSON.stringify(user));
}

export function saveStorefrontSession(token: string, user?: StorefrontUser) {
  setStorefrontAccessToken(token);

  if (user) {
    setStoredStorefrontUser(user);
  }
}

export function clearStorefrontSession() {
  localStorage.removeItem(STOREFRONT_ACCESS_TOKEN_KEY);
  localStorage.removeItem(STOREFRONT_USER_KEY);
  localStorage.removeItem(STOREFRONT_AUTH_PERSIST_KEY);
}
