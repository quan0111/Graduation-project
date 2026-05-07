import type { IUser } from "../../user/types"
import type { IProduct } from "../../product/types"
export interface IShop {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  avatar_url?: string | null

  owner_id: number

  created_at: string
  updated_at: string
  deleted_at?: string | null

  Owner?: IUser
  Products?: IProduct[]
}

export interface IdentityInfo {
  fullName: string
  cccdNumber: string
  cccdFrontImage: File | null
  cccdBackImage: File | null
}

export interface TaxInfo {
  businessType: 'individual' | 'household' | 'company'
  businessRegistrationPlace: string
  registeredEmail: string
  taxNumber: string
  codEnabled: boolean
  dailyDeliveryEnabled: boolean
  expressDeliveryEnabled: boolean
  instantDeliveryEnabled: boolean
  buyNowPayLaterEnabled: boolean
}

export interface ShopInfo {
  shopName: string
  pickupAddress: string
  city: string
  district: string
  ward: string
  email: string
  phone: string
}

export type RegistrationStep = 'shop-info' | 'identity' | 'tax' | 'shipping' | 'complete'

