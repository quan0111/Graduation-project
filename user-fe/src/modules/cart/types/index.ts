import type { IProduct } from "../../product/types"
import type { IProductVariant } from "../../product/types"

export interface ICartDB{
  id: number
  user_id: number
  created_at: string
  updated_at: string
  items: ICartItem[]

}
export interface ICart {
  items: ICartItem[]
  total: number
  itemCount: number
}

export interface ICartShort{
  total: number
  itemCount: number
}
export interface ICartItem {
  id: number | string
  product_id: string
  quantity: number

  product: IProduct
  variant?: IProductVariant

  addedAt?: number
}
