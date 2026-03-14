export interface IRecommendation {
  id: number

  user_id: number
  session_id?: string | null

  recommended: any

  algorithm?: string | null

  timestamp: string

  feedback?: number | null
}