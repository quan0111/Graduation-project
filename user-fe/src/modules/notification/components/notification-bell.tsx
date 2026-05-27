import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { getStorefrontAccessToken } from "@/lib/auth-storage";
import { formatDateTime } from "@/lib/date";
import { useMe } from "@/modules/auth/api/get-auth-me";
import {
  type Notification,
  useGetNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
} from "@/modules/notification/api/notification";
import { buildNotificationDisplay } from "@/modules/notification/utils";

const getWsUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL as string;
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/notifications/ws`;
  return url.toString();
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { data: notifications = [] } = useGetNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const token = getStorefrontAccessToken();
    if (!token) return;

    let reconnectTimer: ReturnType<typeof window.setTimeout> | null = null;
    let reconnectAttempts = 0;
    let closedByClient = false;

    const handleMessage = (event: MessageEvent) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["seller", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["returns", "seller"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "SUPPORT_TICKET") {
          queryClient.invalidateQueries({ queryKey: ["support", "me"] });
          queryClient.invalidateQueries({ queryKey: ["support", "seller"] });
          if (payload?.metadata?.ticketId) {
            queryClient.invalidateQueries({ queryKey: ["support", "detail", payload.metadata.ticketId] });
          }
        }
      } catch {
        // Notification refresh above is enough for legacy payloads.
      }
    };

    const scheduleReconnect = () => {
      if (closedByClient) return;
      const delay = Math.min(1000 * 2 ** reconnectAttempts, 10000);
      reconnectAttempts += 1;
      reconnectTimer = window.setTimeout(connect, delay);
    };

    const connect = () => {
      const ws = new WebSocket(`${getWsUrl()}?token=${encodeURIComponent(token)}`);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectAttempts = 0;
      };
      ws.onmessage = handleMessage;
      ws.onerror = () => ws.close();
      ws.onclose = () => scheduleReconnect();
    };

    connect();

    return () => {
      closedByClient = true;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [queryClient]);

  const handleOpenNotification = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }

    const target = buildNotificationDisplay(notification, user?.role).href;
    setOpen(false);
    if (target) {
      navigate(target);
    }
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" aria-label="Thông báo" onClick={() => setOpen((value) => !value)}>
        <Bell className="size-5 text-slate-600" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-[#ee4d2d] px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">Thông báo vận hành</p>
              <p className="text-xs text-slate-500">{unreadCount} thông báo chưa đọc</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => markAllAsRead.mutate(undefined)}>
              <CheckCheck className="size-4" />
              Đã đọc
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-500">Chưa có thông báo mới.</div>
            ) : (
              notifications.slice(0, 12).map((notification) => {
                const display = buildNotificationDisplay(notification, user?.role);

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleOpenNotification(notification)}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-orange-50/60"
                  >
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {display.typeLabel}
                      </span>
                      {!notification.isRead ? <span className="size-2 rounded-full bg-[#ee4d2d]" /> : null}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{display.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{display.content}</p>
                    <p className="mt-2 text-[11px] text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
