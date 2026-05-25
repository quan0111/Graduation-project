import { useMemo, useState } from "react";
import { CheckCircle2, Eye, MessageSquare, Search, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/date";
import {
  type SupportTicket,
  useAddSupportMessage,
  useAdminSupportTickets,
  useUpdateSupportTicket,
} from "@/modules/support/api/support";

const statusMeta: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Mở", className: "bg-blue-100 text-blue-700" },
  WAITING_SELLER: { label: "Chờ seller", className: "bg-amber-100 text-amber-700" },
  WAITING_CUSTOMER: { label: "Chờ khách", className: "bg-orange-100 text-orange-700" },
  RESOLVED: { label: "Đã xử lý", className: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "Đã đóng", className: "bg-slate-100 text-slate-700" },
};

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const { data: tickets = [], isLoading, isError } = useAdminSupportTickets();
  const addMessage = useAddSupportMessage();
  const updateTicket = useUpdateSupportTicket();

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const keyword = searchTerm.trim().toLowerCase();
        return (
          !keyword ||
          ticket.subject.toLowerCase().includes(keyword) ||
          ticket.user?.email?.toLowerCase().includes(keyword) ||
          ticket.shop?.name?.toLowerCase().includes(keyword) ||
          ticket.id.toString().includes(keyword)
        );
      }),
    [searchTerm, tickets],
  );

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    await addMessage.mutateAsync({ ticketId: selectedTicket.id, message: reply.trim() });
    toast.success("Đã gửi phản hồi");
    setReply("");
  };

  const closeTicket = async (ticket: SupportTicket) => {
    await updateTicket.mutateAsync({ ticketId: ticket.id, status: "RESOLVED" });
    toast.success("Đã đánh dấu ticket xử lý xong");
    setSelectedTicket(null);
  };

  const badge = (status: string) => {
    const meta = statusMeta[status] ?? { label: status, className: "bg-slate-100 text-slate-700" };
    return <Badge className={meta.className}>{meta.label}</Badge>;
  };

  return (
    <main className="flex-1 overflow-auto p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Tin nhắn hỗ trợ</h1>
        <p className="text-muted-foreground">Ticket thật từ người mua, seller và các luồng đổi trả.</p>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã ticket, khách hàng, shop, chủ đề..."
            className="pl-10"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? "Đang tải ticket..." : `${filteredTickets.length} ticket hỗ trợ`}</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="rounded-lg border border-destructive/30 p-4 text-sm text-destructive">
              Không thể tải ticket hỗ trợ.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Chủ đề</th>
                    <th className="px-4 py-3 text-left font-semibold">Khách hàng</th>
                    <th className="px-4 py-3 text-left font-semibold">Cửa hàng</th>
                    <th className="px-4 py-3 text-left font-semibold">Ưu tiên</th>
                    <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold">Cập nhật</th>
                    <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-border hover:bg-card/50">
                      <td className="px-4 py-4 font-mono font-semibold text-primary">TK-{ticket.id}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">{ticket.category || "GENERAL"}</p>
                      </td>
                      <td className="px-4 py-4">{ticket.user?.email || "-"}</td>
                      <td className="px-4 py-4">{ticket.shop?.name || "-"}</td>
                      <td className="px-4 py-4">{ticket.priority}</td>
                      <td className="px-4 py-4">{badge(ticket.status)}</td>
                      <td className="px-4 py-4 text-xs">{formatDateTime(ticket.updatedAt)}</td>
                      <td className="px-4 py-4">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedTicket(ticket)}>
                          <Eye className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-background shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b p-5">
              <div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">TK-{selectedTicket.id}: {selectedTicket.subject}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedTicket.user?.email} · {selectedTicket.shop?.name || "Không gắn shop"}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[82%] rounded-2xl p-3 text-sm ${
                    message.senderRole === "ADMIN" ? "ml-auto bg-orange-600 text-white" : "bg-muted text-foreground"
                  }`}
                >
                  <p className="mb-1 text-xs opacity-70">{message.senderRole} · {message.sender?.email || "Hệ thống"}</p>
                  <p>{message.message}</p>
                  <p className="mt-2 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</p>
                </div>
              ))}
            </div>

            <div className="border-t p-5">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={3}
                className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập phản hồi cho ticket..."
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => closeTicket(selectedTicket)} disabled={updateTicket.isPending}>
                  <CheckCircle2 className="mr-2 size-4" />
                  Đã xử lý
                </Button>
                <Button onClick={sendReply} disabled={!reply.trim() || addMessage.isPending}>
                  <Send className="mr-2 size-4" />
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
