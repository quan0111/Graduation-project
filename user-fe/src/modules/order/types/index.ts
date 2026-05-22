import type { OrderStatusType } from "@/constant";

export type PaymentMethodType = "COD" | "VNPAY" | "MOMO" | "STRIPE";
export type PaymentStatusType =
  | "pending"
  | "pending_payment"
  | "success"
  | "payment_success"
  | "failed"
  | "payment_failed"
  | "payment_expired"
  | "refunding"
  | "refunded"
  | "partially_refunded";
export type ShipmentStatusType =
  | "ready_to_ship"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivery_failed"
  | "return_to_sender"
  | "delivered";

export interface IOrderUser {
  id: number;
  email: string;
  full_name?: string | null;
}

export interface IOrderAddress {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line: string;
  ward?: string | null;
  district: string;
  province: string;
  country?: string | null;
  postal_code?: string | null;
  is_default: boolean;
}

export interface IOrderShop {
  id: number;
  name: string;
}

export interface IOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number | null;
  shop_id: number;
  quantity: number;
  price: number;
  product_name: string;
  variant_name?: string | null;
  product_image?: string | null;
  line_total: number;
  shop?: IOrderShop;
}

export interface IPayment {
  id: number;
  order_id: number;
  method: PaymentMethodType;
  status: PaymentStatusType;
  amount?: number | null;
  provider_order_id?: string | null;
  request_id?: string | null;
  transaction_id?: string | null;
  payment_url?: string | null;
  qr_code_url?: string | null;
  deeplink?: string | null;
  provider_message?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface IShipment {
  id: number;
  order_id: number;
  carrier?: string | null;
  tracking_number?: string | null;
  status: ShipmentStatusType;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
}

export interface IOrderShopPackage {
  id: number;
  order_id: number;
  shop_id: number;
  status: OrderStatusType;
  carrier?: string | null;
  tracking_number?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  shop?: IOrderShop;
}

export interface IOrder {
  id: number;
  user_id: number;
  status: OrderStatusType;
  subtotal: number;
  shipping_fee: number;
  shipping_method?: string | null;
  discount_amount: number;
  total_amount: number;
  shipping_address_id?: number | null;
  coupon_id?: number | null;
  created_at: string;
  updated_at: string;
  user?: IOrderUser | null;
  shipping_address?: IOrderAddress | null;
  shipment?: IShipment | null;
  packages?: IOrderShopPackage[];
  shop_package?: IOrderShopPackage | null;
  items: IOrderItem[];
  payment?: IPayment | null;
}

export interface ICreateOrderFormInputs {
  userId: number;
  subtotal: number;
  shippingFee: number;
  shippingMethod?: string | null;
  discountAmount: number;
  totalAmount: number;
  shippingAddressId?: number | null;
  couponId?: number | null;
  couponIds?: number[];
  items: {
    productId: number;
    variantId?: number | null;
    shopId: number;
    quantity: number;
    price: number;
  }[];
  payment?: {
    method: PaymentMethodType;
    status?: string;
  };
}

export interface IShipmentMutationPayload {
  orderId: number;
  carrier?: string;
  trackingNumber?: string;
  status?: Uppercase<ShipmentStatusType>;
}
