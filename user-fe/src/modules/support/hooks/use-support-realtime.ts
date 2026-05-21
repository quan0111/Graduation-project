import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { API_URL } from "@/constant/config";
import { getStorefrontAccessToken } from "@/lib/auth-storage";

type SupportRealtimeEvent = {
  event?: string;
  ticketId?: number;
  shopId?: number | null;
  orderId?: number | null;
  message?: {
    id: number;
    ticketId: number;
    senderId?: number | null;
    senderRole: string;
    message: string;
    createdAt: string;
  } | null;
};

const getSupportWsUrl = () => {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/support/ws`;
  return url.toString();
};

export function useSupportRealtime({
  enabled = true,
  onMessage,
}: {
  enabled?: boolean;
  onMessage?: (event: SupportRealtimeEvent) => void;
} = {}) {
  const queryClient = useQueryClient();
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const token = getStorefrontAccessToken();
    if (!enabled || !token) return;

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof window.setTimeout> | null = null;
    let reconnectAttempts = 0;
    let closedByClient = false;

    const scheduleReconnect = () => {
      if (closedByClient) return;
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);
      reconnectAttempts += 1;
      reconnectTimer = window.setTimeout(connect, delay);
    };

    const handleEvent = (event: SupportRealtimeEvent) => {
      queryClient.invalidateQueries({ queryKey: ["support", "me"] });
      queryClient.invalidateQueries({ queryKey: ["support", "seller"] });

      if (event.ticketId) {
        queryClient.invalidateQueries({ queryKey: ["support", "detail", event.ticketId] });
      }

      onMessageRef.current?.(event);
    };

    const connect = () => {
      socket = new WebSocket(`${getSupportWsUrl()}?token=${encodeURIComponent(token)}`);

      socket.onopen = () => {
        reconnectAttempts = 0;
      };

      socket.onmessage = (messageEvent) => {
        try {
          handleEvent(JSON.parse(messageEvent.data) as SupportRealtimeEvent);
        } catch {
          handleEvent({});
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        scheduleReconnect();
      };
    };

    connect();

    return () => {
      closedByClient = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [enabled, queryClient]);
}
