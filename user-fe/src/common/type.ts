export type ID = number;

export interface BaseEntity {
  id: ID
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
}