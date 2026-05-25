export const UserRole = {
  Admin: "admin",
  Seller: "seller",
  Customer: "customer",
} as const;

export type UserRoleType =
  (typeof UserRole)[keyof typeof UserRole];

export const UserRoleLabel: Record<UserRoleType, string> = {
  admin: "ADMIN",
  seller: "SELLER",
  customer: "CUSTOMER",
};

export const USER_ROLE_OPTIONS = [
  { value: UserRole.Admin, label: "Admin" },
  { value: UserRole.Seller, label: "Seller" },
  { value: UserRole.Customer, label: "Customer" },
] as const;

export const AddressType = {
  Home: "home",
  Office: "office",
  Other: "other",
} as const;

export type AddressTypeValue =
  (typeof AddressType)[keyof typeof AddressType];

export const AddressTypeLabel: Record<AddressTypeValue, string> = {
  home: "Nhà riêng",
  office: "Văn phòng",
  other: "Khác",
};
export const ProductStatus = {
  Draft: "DRAFT",
  Active: "ACTIVE",
  OutOfStock: "OUT_OF_STOCK",
  Banned: "BANNED",
} as const;

export type ProductStatusType =
  (typeof ProductStatus)[keyof typeof ProductStatus];

export const ProductStatusLabel: Record<ProductStatusType, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang bán",
  OUT_OF_STOCK: "Hết hàng",
  BANNED: "Bị khóa",
};
export const OrderStatus = {
  Pending: "pending",
  Confirmed: "confirmed",
  Paid: "paid",
  Processing: "processing",
  ReadyToShip: "ready_to_ship",
  Shipped: "shipped",
  InTransit: "in_transit",
  Delivered: "delivered",
  Completed: "completed",
  Cancelled: "cancelled",
  ReturnRequested: "return_requested",
  Returned: "returned",
} as const;

export type OrderStatusType =
  (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  Cod: "cod",
  Momo: "momo",
  Vnpay: "vnpay",
  Stripe: "stripe",
} as const;

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

  export const PaymentStatus = {
  Pending: "pending",
  PendingPayment: "pending_payment",
  Success: "success",
  PaymentSuccess: "payment_success",
  Failed: "failed",
  PaymentFailed: "payment_failed",
  PaymentExpired: "payment_expired",
  Refunding: "refunding",
  Refunded: "refunded",
  RefundFailed: "refund_failed",
  PartiallyRefunded: "partially_refunded",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const DiscountType = {
  Percentage: "percentage",
  Fixed: "fixed",
} as const;

export type DiscountTypeValue =
  (typeof DiscountType)[keyof typeof DiscountType];

export const BehaviorType = {
  View: "view",
  Click: "click",
  AddToCart: "add_to_cart",
  Purchase: "purchase",
} as const;

export type BehaviorTypeValue =
  (typeof BehaviorType)[keyof typeof BehaviorType];

export const NotificationType = {
  OrderUpdate: "order_update",
  Promotion: "promotion",
  System: "system",
  Chat: "chat",
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

