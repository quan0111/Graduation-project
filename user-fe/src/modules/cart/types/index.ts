import type { IProduct } from "../../product/types"
import type { IProductVariant } from "../../product/types"

export interface ICart {
  id: number
  user_id: number

  created_at: string
  updated_at: string

  Items?: ICartItem[]
}
export interface ICartItem {
  id: number
  cart_id: number
  product_id: number
  variant_id?: number | null

  quantity: number

  Product?: IProduct
  Variant?: IProductVariant
}