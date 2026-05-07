import type { IProduct } from "@/modules/product/types";

export type BehaviorAction = "VIEW" | "CLICK" | "ADD_TO_CART" | "PURCHASE";

export interface TrackBehaviorPayload {
  productId: number;
  action: BehaviorAction;
  sessionId?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export interface RecommendationQuery {
  topK?: number;
  productId?: number;
}

export interface RecommendationResult {
  products: IProduct[];
}
