import type { IAddress } from "../../address/types"
import type { IShop } from "../../seller/types"
import type { IProduct } from "../../product/types"
import type {  ICart, ICartShort } from "@/modules/cart/types"
export type UserRoleType =
  | "ADMIN"
  | "SELLER"
  | "CUSTOMER"
export type BehaviorType =
  | "VIEW"
  | "CLICK"
  | "ADD_TO_CART"
  | "PURCHASE"

export interface IUser {
  id: number
  email: string
  password: string
  full_name?: string | null
  avatar_url?: string | null
  role: UserRoleType
  is_active: boolean

  created_at: string
  updated_at: string
  deleted_at?: string | null
  Cart : ICart
  Addresses?: IAddress[]
  Shops?: IShop[]
}
export interface IUserBehavior {
  id: number

  user_id: number
  product_id: number

  action: BehaviorType

  session_id?: string | null
  duration?: number | null

  metadata?: any

  created_at: string
  deleted_at?: string | null

  User?: IUser
  Product?: IProduct
}