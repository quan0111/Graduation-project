const rawApiUrl = import.meta.env.VITE_API_URL

if (!rawApiUrl) {
  throw new Error("Missing required env VITE_API_URL")
}

export const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl : `${rawApiUrl}/`
export const API_URL_LOGIN = `${API_URL}auth`
export const API_URL_SHOP = `${API_URL}shops`
export const API_URL_PRODUCT = `${API_URL}products`
export const API_URL_USER = `${API_URL}users`
export const API_URL_CART = `${API_URL}cart`
export const API_URL_CATEGORY = `${API_URL}categories`
export const API_URL_NOTIFICATION = `${API_URL}notifications`
export const API_URL_ADDRESS = `${API_URL}addresses`
export const API_URL_COUPON = `${API_URL}coupons`
export const API_URL_REVIEW = `${API_URL}reviews`
export const API_URL_RETURN = `${API_URL}returns`
export const API_URL_FOLLOW = `${API_URL}shop-follow`
export const API_URL_ANALYTICS = `${API_URL}analytics`
export const API_URL_BEHAVIOR = API_URL_ANALYTICS
export const API_URL_CHATBOT = `${API_URL}chatbot`
export const API_URL_ORDER = `${API_URL}orders`
export const API_URL_SHIPMENT = `${API_URL}shipments`
export const API_URL_MODERATION = `${API_URL}moderation`
export const API_URL_FINANCE = `${API_URL}finance`
export const API_URL_INVENTORY = `${API_URL}inventory`
export const API_URL_SUPPORT = `${API_URL}support`
export const API_URL_WISHLIST = `${API_URL}wishlist`
export const API_URL_MARKETING = `${API_URL}marketing`



