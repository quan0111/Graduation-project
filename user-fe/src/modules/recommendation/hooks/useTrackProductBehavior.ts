import { useCallback } from "react";

import { useTrackBehavior } from "@/modules/recommendation/api/track-behavior";
import type { BehaviorAction } from "@/modules/recommendation/types";
import { getRecommendationSessionId, recordSessionProductId } from "@/modules/recommendation/utils/recommendation-session";

export const useTrackProductBehavior = () => {
  const mutation = useTrackBehavior();

  const track = useCallback(
    (productId: number, action: BehaviorAction, metadata?: Record<string, unknown>) => {
      recordSessionProductId(productId);
      mutation.mutate({
        productId,
        action,
        sessionId: getRecommendationSessionId(),
        metadata,
      });
    },
    [mutation],
  );

  return {
    track,
    trackView: useCallback((productId: number, metadata?: Record<string, unknown>) => track(productId, "VIEW", metadata), [track]),
    trackClick: useCallback((productId: number, metadata?: Record<string, unknown>) => track(productId, "CLICK", metadata), [track]),
    trackAddToCart: useCallback(
      (productId: number, metadata?: Record<string, unknown>) => track(productId, "ADD_TO_CART", metadata),
      [track],
    ),
    trackPurchase: useCallback(
      (productId: number, metadata?: Record<string, unknown>) => track(productId, "PURCHASE", metadata),
      [track],
    ),
  };
};
