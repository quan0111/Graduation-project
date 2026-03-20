import type { IShop } from "../../shop/types"
import type { ICategory } from "../../category/types"
export type ProductStatusType =
  | "DRAFT"
  | "ACTIVE"
  | "OUT_OF_STOCK"
  | "BANNED"

export interface IProduct {
  id: string
  name: string
  slug?: string | null
  description?: string | null

  price: number
  shop_id: number
  category_id: number

  status: ProductStatusType

  created_at: string
  updated_at: string
  deleted_at?: string | null

  Shop?: IShop
  Category?: ICategory
  Variants?: IProductVariant[]
  Images?: IProductImage[]
}
export interface IProductVariant {
  id: number
  sku?: string | null

  name: string
  stock: number
  weight?: number | null

  product_id: number

  created_at: string
  updated_at: string
  deleted_at?: string | null
  VariantImage: IVariantImage[]
  Product?: IProduct

}
export interface IProductFormInputs {
  name: string
  slug?: string | null
  description?: string | null

  price: number
  shop_id: number
  category_id: number

  status: ProductStatusType

  variants?: {
    name: string
    stock: number
    weight?: number
  }[]
}
export interface IProductImage {
  id: number

  url: string
  position: number

  is_primary: boolean

  product_id: number

  created_at: string
  deleted_at?: string | null
}
export interface IVariantImage {
  id: number

  url: string
  position: number

  variant_id: number

  created_at: string
  deleted_at?: string | null
}
export interface IProductAttribute {
  id: number

  product_id: number

  key: string
  value: string
}
export interface ITag {
  id: number
  name: string

  Products?: IProduct[]
}