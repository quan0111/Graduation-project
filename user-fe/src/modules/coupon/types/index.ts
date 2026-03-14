export interface ICoupon {
  id: number

  code: string

  description?: string | null

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

  created_at: string
  updated_at: string
}
export type DiscountType =
  | "PERCENTAGE"
  | "FIXED"

  