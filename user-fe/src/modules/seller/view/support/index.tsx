import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/date";
import { SellerDashboardLayout } from "@/modules/seller/component/shop-layout";
import { useAddSupportMessage, useSellerSupportTickets } from "@/modules/support/api/support";
import { useSupportRealtime } from "@/modules/support/hooks/use-support-realtime";

export default function SellerSupportPage() {
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const { data: tickets = [], isLoading } = useSellerSupportTickets();
  const addMessage = useAddSupportMessage();
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  useSupportRealtime();

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    await addMessage.mutateAsync({ ticketId: selectedTicket.id, message: reply.trim() });
    toast.success("Đã gửi phản hồi cho khách hàng");
    setReply("");
  };

  return (
    <SellerDashboardLayout>
      <section className="space-y-6">
        <div className="rounded-4xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-sm uppercase tracking-[0.24em] text-[#ee4d2d]">Hộp thư hỗ trợ</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">Tin nhắn hỗ trợ từ khách hàng</h1>
          <p className="mt-2 text-sm text-slate-500">Trao đổi theo ticket thật, gắn với đơn hàng/shop khi có dữ liệu.</p>
        </div>

        <Card className="border-0 bg-white shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle>{isLoading ? "Đang tải..." : `${tickets.length} ticket`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => setSelectedTicketId(ticket.id)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-100 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50/50"
              >
                <div>
                  <p className="font-semibold text-slate-950">TK-{ticket.id}: {ticket.subject}</p>
                  <p className="mt-1 text-sm text-slate-500">{ticket.user?.email || "Khách hàng"} · {ticket.messages.length} tin nhắn</p>
                </div>
                <Badge variant="outline">{ticket.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl">
              <div className="flex items-start justify-between border-b p-5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-5 text-[#ee4d2d]" />
                  <h2 className="text-lg font-semibold text-slate-950">TK-{selectedTicket.id}: {selectedTicket.subject}</h2>
                </div>
                <button onClick={() => setSelectedTicketId(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {selectedTicket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[82%] rounded-2xl p-3 text-sm ${
                      message.senderRole === "SELLER" ? "ml-auto bg-[#ee4d2d] text-white" : "bg-slate-100 text-slate-900"
                    }`}
                  >
                    <p className="mb-1 text-xs opacity-70">{message.senderRole}</p>
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
                  className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                  placeholder="Nhập phản hồi..."
                />
                <div className="flex justify-end">
                  <Button onClick={sendReply} disabled={!reply.trim() || addMessage.isPending} className="bg-[#ee4d2d] hover:bg-[#d93f21]">
                    <Send className="mr-2 size-4" />
                    Gửi phản hồi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </SellerDashboardLayout>
  );
}
