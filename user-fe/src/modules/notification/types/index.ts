export type NotificationType =
  | "ORDER_UPDATE"
  | "PAYMENT_UPDATE"
  | "RETURN_UPDATE"
  | "REFUND_UPDATE"
  | "PROMOTION"
  | "SYSTEM"
  | "CHAT"
  | "PRODUCT_BANNED"
  | "SUPPORT_TICKET"
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
