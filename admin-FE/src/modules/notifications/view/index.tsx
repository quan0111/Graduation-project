import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { API_URL, API_URL_NOTIFICATION } from "@/constant/config";
import { apiClient } from "@/lib/api";
import { getAdminAccessToken } from "@/lib/auth-storage";

type AdminNotification = {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

const typeLabel: Record<string, string> = {
  ORDER_UPDATE: "Đơn hàng",
  PAYMENT_UPDATE: "Thanh toán",
  RETURN_UPDATE: "Đổi trả",
  REFUND_UPDATE: "Hoàn tiền",
  PRODUCT_BANNED: "Sản phẩm",
  SUPPORT_TICKET: "Hỗ trợ",
  PROMOTION: "Khuyến mãi",
  SYSTEM: "Hệ thống",
  CHAT: "Chat",
};

const getWsUrl = () => {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/notifications/ws`;
  return url.toString();
};

const getNotifications = async (): Promise<AdminNotification[]> => {
  const response = await apiClient.get(API_URL_NOTIFICATION);
  return response.data;
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: getNotifications,
  });

  const markRead = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.patch(`${API_URL_NOTIFICATION}/${id}/read`);
      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`${API_URL_NOTIFICATION}/read-all`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`${API_URL_NOTIFICATION}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  useEffect(() => {
    const token = getAdminAccessToken();
    if (!token) return;

    const ws = new WebSocket(`${getWsUrl()}?token=${encodeURIComponent(token)}`);
    ws.onmessage = () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "payouts"] });
    };

    return () => ws.close();
  }, [queryClient]);

  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filtered = useMemo(
    () => (filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications),
    [filter, notifications],
  );

  return (
    <main className="flex-1 space-y-6 overflow-auto p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Thông báo</p>
          <h1 className="mt-2 text-2xl font-bold">Thông báo admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Danh sách lấy từ API `/notifications` và tự refresh qua WebSocket khi có thông báo mới.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || unreadCount === 0}
        >
          <CheckCheck className="size-4" />
          Đánh dấu đã đọc
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="Tổng thông báo" value={notifications.length.toLocaleString("vi-VN")} />
        <Metric title="Chưa đọc" value={unreadCount.toLocaleString("vi-VN")} />
        <Metric title="Đã đọc" value={(notifications.length - unreadCount).toLocaleString("vi-VN")} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="size-5" />
                Hộp thông báo
              </CardTitle>
              <CardDescription>{filtered.length} thông báo đang hiển thị</CardDescription>
            </div>
            <div className="flex rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-md px-3 py-1.5 text-sm ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={`rounded-md px-3 py-1.5 text-sm ${filter === "unread" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Chưa đọc
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Đang tải thông báo...</p> : null}
          {isError ? <p className="py-8 text-center text-sm text-destructive">Không thể tải thông báo.</p> : null}

          {!isLoading && !isError ? (
            <div className="divide-y rounded-xl border">
              {filtered.map((notification) => (
                <div key={notification.id} className={`flex gap-4 p-4 ${notification.isRead ? "bg-white" : "bg-primary/5"}`}>
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bell className="size-5" />
                  </div>
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      if (!notification.isRead) {
                        markRead.mutate(notification.id);
                      }
                    }}
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {typeLabel[notification.type] ?? notification.type}
                      </span>
                      {!notification.isRead ? <span className="size-2 rounded-full bg-primary" /> : null}
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="font-semibold">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{notification.content}</p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteNotification.mutate(notification.id)}
                    disabled={deleteNotification.isPending}
                    aria-label="Xóa thông báo"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Không có thông báo phù hợp.</p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle>{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
