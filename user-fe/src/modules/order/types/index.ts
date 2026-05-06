  import type { IProductVariant } from "@/modules/promotion/types"
import type { IProduct } from "../../product/types"
import type { IUser } from "../../user/types"
import type { IShop } from "@/modules/shop/types"
import type { OrderStatusType } from "@/constant"

export interface IOrder {
  id: number
  user_id: number

  status: OrderStatusType

  subtotal: number
  shipping_fee: number
  discount_amount: number
  total_amount: number

  shipping_address_id?: number | null
  coupon_id?: number | null

  created_at: string
  updated_at: string
  deleted_at?: string | null

  User?: IUser
  Items?: IOrderItem[]
  Payment?: IPayment
}
export interface IOrderItem {
  id: number
  order_id: number

  quantity: number
  price: number

  created_at: string
  deleted_at?: string | null

  shop?: IShop
  variant?: IProductVariant
  Product?: IProduct
}
export type PaymentMethodType =
  | "COD"
  | "VNPAY"
  | "STRIPE"

export type PaymentStatusType =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"

export interface IPayment {
  id: number
  order_id: number

  method: PaymentMethodType
  status: PaymentStatusType

  created_at: string
  deleted_at?: string | null
}
export interface ICreateOrderFormInputs {
  userId: number;

  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  items: {
    productId: number;
    variantId?: number | null;
    quantity: number;
    price: number;
  }[];

  payment?: {
    method: PaymentMethodType;
  };
}

export interface IApiPayment {
  id: number;

  orderId: number;

  method: PaymentMethodType;
  status: PaymentStatusType;

  createdAt: string;
}


export interface IApiOrderItem {
  id: number;

  orderId: number;

  productId: number;
  variantId?: number | null;
  shopId: number;

  quantity: number;
  price: number;

  productName?: string;
  variantName?: string;
  productImage?: string | null;
}

export interface IApiOrder {
  id: number;

  userId: number;

  status: OrderStatusType;

  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  createdAt: string;

  items: IApiOrderItem[];

  payment?: IApiPayment;
  }