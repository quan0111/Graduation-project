import type { IAddress } from "../../address/types"
import type { IProduct } from "../../products/types"
import type { IShop } from "../../shop/types"

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
  password?: string
  fullName?: string | null
  avatarUrl?: string | null
  role: UserRoleType
  isActive: boolean

  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  phone?: string | null
  addresses?: IAddress[]
  cart?: any
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