import type { IUser } from "../../user/types"
export type AddressType =
  | "HOME"
  | "OFFICE"
  | "OTHER"

export interface IAddress {
  id: number
  user_id: number

  full_name: string
  phone: string
  address_line: string
  ward?: string | null
  district: string
  province: string
  country: string
  postal_code?: string | null

  is_default: boolean
  type: AddressType

  created_at: string
  updated_at: string
  deleted_at?: string | null

  User?: IUser
}