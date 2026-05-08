export interface ICategory {
  id: number
  name: string
  slug?: string | null

  parentId?: number | null

  createdAt: string
  updatedAt: string
  deletedAt?: string | null

  parent?: ICategory
  children?: ICategory[]
}
