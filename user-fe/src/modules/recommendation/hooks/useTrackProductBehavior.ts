import { useCallback } from "react";

import { useTrackBehavior } from "@/modules/recommendation/api/track-behavior";
import type { BehaviorAction } from "@/modules/recommendation/types";

const SESSION_STORAGE_KEY = "market_session_id";

const getSessionId = () => {
  if (typeof window === "undefined") {
    return undefined;
  }

  const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const nextId = `sess_${crypto.randomUUID()}`;
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextId);
  return nextId;
};

export const useTrackProductBehavior = () => {
  const mutation = useTrackBehavior();

  const track = useCallback(
    (productId: number, action: BehaviorAction, metadata?: Record<string, unknown>) => {
      mutation.mutate({
        productId,
        action,
        sessionId: getSessionId(),
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
