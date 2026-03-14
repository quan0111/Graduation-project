export interface ICategory {
  id: number
  name: string
  slug?: string | null

  parent_id?: number | null

  created_at: string
  updated_at: string
  deleted_at?: string | null

  Parent?: ICategory
  Children?: ICategory[]
}
