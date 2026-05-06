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

