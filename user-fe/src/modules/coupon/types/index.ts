export interface ICoupon {
  id: number

  code: string

  description?: string | null
  scope?: "ORDER" | "SHIPPING" | "SHOP" | "CATEGORY" | "PRODUCT"

  discount_type: DiscountType
  discount_value: number

  min_order_amount?: number | null
  max_discount?: number | null

  usage_limit?: number | null
  used_count: number

  valid_from?: string | null
  valid_until?: string | null

  is_active: boolean

  applicable_shop_id?: number | null
  applicable_category_id?: number | null
  applicable_product_id?: number | null
  applicable_product_ids?: number[]
  productTargets?: Array<{
    couponId: number
    productId: number
    product?: {
      id: number
      name: string
      price: number
      status: string
    } | null
  }>

  created_at: string
  updated_at: string
}
export type DiscountType =
  | "PERCENTAGE"
  | "FIXED"

  
