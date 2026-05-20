const RAW_API_URL = import.meta.env.VITE_API_URL;

if (!RAW_API_URL) {
  throw new Error("Missing VITE_API_URL");
}

export const API_URL = RAW_API_URL.endsWith("/") ? RAW_API_URL : `${RAW_API_URL}/`;
export const API_URL_LOGIN = `${API_URL}auth`;
export const API_URL_SHOP = `${API_URL}shops`;
export const API_URL_PRODUCT = `${API_URL}products`;
export const API_URL_USER = `${API_URL}users`;
export const API_URL_CART = `${API_URL}cart`;
export const API_URL_CATEGORY = `${API_URL}categories`;
export const API_URL_NOTIFICATION = `${API_URL}notifications`;
export const API_URL_ADDRESS = `${API_URL}addresses`;
export const API_URL_COUPON = `${API_URL}coupons`;
export const API_URL_REVIEW = `${API_URL}reviews`;
export const API_URL_FOLLOW = `${API_URL}followers`;
export const API_URL_ANALYTICS = `${API_URL}analytics`;
export const API_URL_BEHAVIOR = `${API_URL}shops`;
export const API_URL_ORDER = `${API_URL}orders`;
export const API_URL_SELLER = `${API_URL}sellers`;
export const API_URL_ADMIN = `${API_URL}admin`;
export const API_URL_RETURN = `${API_URL}returns`;
export const API_URL_FINANCE = `${API_URL}finance`;
export const API_URL_MARKETING = `${API_URL}marketing`;
export const API_URL_FLASH_SALE = `${API_URL}flash-sales`;
export const API_URL_SHIPMENT = `${API_URL}shipments`;
export const API_URL_AUDIT = `${API_URL}audit`;
export const API_URL_SECURITY = `${API_URL}security`;
export const API_URL_MODERATION = `${API_URL}moderation`;
export const API_URL_INVENTORY = `${API_URL}inventory`;
