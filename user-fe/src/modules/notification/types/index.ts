export type NotificationType =
  | "ORDER_UPDATE"
  | "PROMOTION"
  | "SYSTEM"
  | "CHAT"
export interface INotification {
  id: number

  user_id: number

  title: string
  content: string

  type: NotificationType

  is_read: boolean

  metadata?: any

  created_at: string
}