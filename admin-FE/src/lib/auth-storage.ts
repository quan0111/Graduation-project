type AdminUser = {
  id: number | string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
};

export const ADMIN_ACCESS_TOKEN_KEY = "admin_access_token";
export const ADMIN_USER_KEY = "admin_user";

export function getAdminAccessToken() {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string) {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
}

export function getStoredAdminUser<T = AdminUser>() {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredAdminUser(user: AdminUser) {
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function saveAdminSession(token: string, user?: AdminUser) {
  setAdminAccessToken(token);

  if (user) {
    setStoredAdminUser(user);
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}
