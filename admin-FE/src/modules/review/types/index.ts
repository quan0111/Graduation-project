import type { IUser } from "../../user/types"
import type { IProduct } from "../../products/types"
export interface IReview {
  id: number

  rating: number
  comment?: string | null

  is_verified_purchase: boolean

  user_id: number
  product_id: number

  created_at: string
  deleted_at?: string | null

  User?: IUser
  Product?: IProduct
}