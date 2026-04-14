import type { IProduct } from "../../products/types"
import type { IUser } from "../../user/types"
export type OrderStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PROCESSING"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"

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
  product_id: number

  quantity: number
  price: number

  product_name: string
  variant_name?: string | null
  product_image?: string | null

  created_at: string
  deleted_at?: string | null

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
  shipping_address_id: number
  coupon_id?: number

  items: {
    product_id: number
    variant_id?: number
    quantity: number
  }[]
}