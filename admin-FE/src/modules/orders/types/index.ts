import type { IProduct } from "../../products/types"
import type { IUser } from "../../user/types"
export type OrderStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "PAYMENT_FAILED"
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
  userId?: number

  status: OrderStatusType

  subtotal?: number
  shippingFee?: number
  discountAmount?: number
  totalAmount?: number

  shippingAddressId?: number | null
  couponId?: number | null

  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null

  User?: IUser
  user?: any
  Items?: IOrderItem[]
  items?: IOrderItem[]
  Payment?: IPayment
  payment?: IPayment
  shop?: any
}
export interface IOrderItem {
  id: number
  orderId?: number
  productId?: number

  quantity: number
  price: number

  productName?: string
  variantName?: string | null
  productImage?: string | null

  createdAt?: string
  deletedAt?: string | null

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
  orderId?: number

  method?: PaymentMethodType
  status?: PaymentStatusType

  createdAt?: string
  deletedAt?: string | null
}
export interface ICreateOrderFormInputs {
  shippingAddressId: number
  couponId?: number

  items: {
    productId: number
    variantId?: number
    quantity: number
  }[]
}
