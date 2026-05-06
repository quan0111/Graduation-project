import type { IShop } from "../../seller/types"
import type { ICategory } from "../../category/types"
import type { IReview } from "@/modules/review/types"
export type ProductStatusType =
  | "DRAFT"
  | "ACTIVE"
  | "OUT_OF_STOCK"
  | "BANNED"

export interface IProduct {
  stock: number;
  id: number;

  name: string;
  slug?: string | null;
  description?: string | null;

  price: number;

  shop_id: number;
  category_id: number;

  status: ProductStatusType;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  shop?: IShop;
  category?: ICategory;
  variants?: IProductVariant[];
  images?: IProductImage[];
  reviews?: IReview[];

  attributes?: IProductAttribute[];
  tags?: ITag[];
}
export interface IProductVariant {
  id: number;

  sku?: string | null;
  price?: number;

  name: string;
  stock: number;
  weight?: number | null;

  product_id: number;

  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  variantImages?: IVariantImage[];
  product?: IProduct;
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