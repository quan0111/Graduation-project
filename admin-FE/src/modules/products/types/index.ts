import type { ICategory } from "../../categories/types"
import type { IShop } from "../../shop/types"
import type { ProductStatusType } from "@/constant"
import type { IReview } from "@/modules/review/types"

export interface IProduct {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  price: number

  // ✅ đúng BE
  shopId: number
  categoryId: number

  status: ProductStatusType

  // ✅ đúng BE
  createdAt: string

  // ❌ BE chưa có thì để optional
  updatedAt?: string
  deletedAt?: string | null

  // ✅ relation đúng BE
  shop?: IShop
  category?: ICategory
  variants?: IProductVariant[]
  images?: IProductImage[] | null
  attributes?: IProductAttribute[] | null
  tags?: ITag[]

  // extra BE có
  totalStock?: number

  review?: IReview[]
}
export interface IProductVariant {
  id: number
  sku?: string | null
  price?: number
  name: string
  stock: number
  weight?: number | null

  // ❌ BE KHÔNG có product_id → bỏ
  // product_id: number

  createdAt: string
  updatedAt?: string
  deletedAt?: string | null

  images?: IVariantImage[] | null
}
export interface IProductImage {
  id: number
  url: string
  position: number
  isPrimary: boolean
  productId: number

  createdAt: string
  deletedAt?: string | null
}
export interface IVariantImage {
  id: number
  url: string
  position: number
  variantId: number

  createdAt: string
  deletedAt?: string | null
}
export interface IProductAttribute {
  id: number
  productId: number
  key: string
  value: string
}
export interface ITag {
  id: number
  name: string
}
export interface IProductFormInputs {
  name: string
  slug?: string | null
  description?: string | null

  price: number
  shopId: number
  categoryId: number

  status: ProductStatusType

  variants?: {
    name: string
    stock: number
    weight?: number
  }[]
}