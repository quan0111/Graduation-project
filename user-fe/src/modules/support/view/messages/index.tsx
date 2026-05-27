import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Inbox, MessageCircle, Package, Plus, Send, Store } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatShortDateTime } from "@/lib/date";
import {
  type SupportMessage,
  type SupportTicket,
  useAddSupportMessage,
  useCreateSupportTicket,
  useMySupportTickets,
  useSupportTicket,
} from "@/modules/support/api/support";
import { useSupportRealtime } from "@/modules/support/hooks/use-support-realtime";

const statusLabel: Record<string, string> = {
  OPEN: "Đang mở",
  WAITING_SELLER: "Chờ shop",
  WAITING_CUSTOMER: "Chờ bạn",
  RESOLVED: "Đã xử lý",
  CLOSED: "Đã đóng",
};

const senderLabel: Record<string, string> = {
  CUSTOMER: "Bạn",
  SELLER: "Shop",
  ADMIN: "CSKH",
  SYSTEM: "Hệ thống",
};

const parsePositiveInt = (value: string | null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const getLastMessage = (ticket: SupportTicket) => ticket.messages[ticket.messages.length - 1];

export default function CustomerMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramKey = searchParams.toString();
  const paramTicketId = parsePositiveInt(searchParams.get("ticketId"));
  const paramShopId = parsePositiveInt(searchParams.get("shopId"));
  const paramOrderId = parsePositiveInt(searchParams.get("orderId"));
  const paramShopName = searchParams.get("shopName") ?? "";
  const paramProductName = searchParams.get("productName") ?? "";
  const defaultSubject = searchParams.get("subject") || `Trao đổi với ${paramShopName || `shop #${paramShopId ?? ""}`}`;
  const defaultMessage = paramProductName ? `Tôi muốn hỏi thêm về sản phẩm ${paramProductName}.` : "";

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [handledParamKey, setHandledParamKey] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [firstMessage, setFirstMessage] = useState(defaultMessage);
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data: tickets = [], isLoading, isError } = useMySupportTickets();
  const { data: ticketDetail } = useSupportTicket(selectedTicketId);
  const createTicket = useCreateSupportTicket();
  const addMessage = useAddSupportMessage();
  useSupportRealtime();

  const sortedTickets = useMemo(
    () =>
      [...tickets].sort((left, right) => {
        const leftTime = new Date(left.updatedAt).getTime();
        const rightTime = new Date(right.updatedAt).getTime();
        return rightTime - leftTime;
      }),
    [tickets],
  );

  const selectedFromList = useMemo(
    () => sortedTickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, sortedTickets],
  );
  const selectedTicket = ticketDetail ?? selectedFromList;

  useEffect(() => {
    if (!paramTicketId || handledParamKey === paramKey || isLoading) return;

    const existingTicket = sortedTickets.find((ticket) => ticket.id === paramTicketId);
    if (existingTicket) {
      setSelectedTicketId(existingTicket.id);
      setShowComposer(false);
      setHandledParamKey(paramKey);
    }
  }, [handledParamKey, isLoading, paramKey, paramTicketId, sortedTickets]);

  useEffect(() => {
    if (!paramShopId || handledParamKey === paramKey || isLoading) return;

    const existingTicket = sortedTickets.find((ticket) => ticket.shopId === paramShopId);
    setSubject(defaultSubject);
    setFirstMessage(defaultMessage);

    if (existingTicket) {
      setSelectedTicketId(existingTicket.id);
      setShowComposer(false);
    } else {
      setSelectedTicketId(null);
      setShowComposer(true);
    }

    setHandledParamKey(paramKey);
  }, [defaultMessage, defaultSubject, handledParamKey, isLoading, paramKey, paramShopId, sortedTickets]);

  useEffect(() => {
    if (!isLoading && !showComposer && !selectedTicketId && sortedTickets[0]) {
      setSelectedTicketId(sortedTickets[0].id);
    }
  }, [isLoading, selectedTicketId, showComposer, sortedTickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [selectedTicket?.messages.length]);

  const createConversation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paramShopId) {
      toast.error("Chưa chọn shop để bắt đầu chat");
      return;
    }

    const trimmedSubject = subject.trim() || `Trao đổi với ${paramShopName || `shop #${paramShopId}`}`;
    const trimmedMessage = firstMessage.trim();
    if (trimmedMessage.length < 2) {
      toast.error("Tin nhắn đầu tiên cần ít nhất 2 ký tự");
      return;
    }

    try {
      const ticket = await createTicket.mutateAsync({
        subject: trimmedSubject,
        message: trimmedMessage,
        shopId: paramShopId,
        orderId: paramOrderId ?? undefined,
        category: "SHOP_CHAT",
        priority: "MEDIUM",
      });
      setSelectedTicketId(ticket.id);
      setShowComposer(false);
      setReply("");
      setSearchParams({});
      toast.success("Đã mở cuộc trò chuyện với shop");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Không thể mở cuộc trò chuyện";
      toast.error(detail);
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    try {
      await addMessage.mutateAsync({ ticketId: selectedTicket.id, message: reply.trim() });
      setReply("");
    } catch {
      toast.error("Không thể gửi tin nhắn");
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className={`${buttonVariants({ variant: "outline" })} inline-flex`}>
            <ChevronLeft className="size-4" />
            Về trang chủ
          </Link>
          <Button
            type="button"
            onClick={() => {
              setShowComposer(true);
              setSelectedTicketId(null);
            }}
            variant="outline"
          >
            <Plus className="size-4" />
            Cuộc trò chuyện mới
          </Button>
        </div>

        <div className="grid min-h-170 overflow-hidden rounded-4xl bg-white shadow-sm ring-1 ring-slate-200/80 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50/80 lg:border-b-0 lg:border-r">
            <div className="border-b border-slate-200 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ee4d2d]">Tin nhắn</p>
              <h1 className="mt-2 text-2xl font-bold text-slate-950">Chat với shop</h1>
            </div>

            <div className="max-h-152.5 space-y-2 overflow-y-auto p-3">
              {isLoading ? <p className="p-4 text-sm text-slate-500">Đang tải tin nhắn...</p> : null}
              {isError ? <p className="p-4 text-sm text-rose-500">Không thể tải danh sách tin nhắn.</p> : null}

              {!isLoading && sortedTickets.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center">
                  <Inbox className="mx-auto mb-3 size-8 text-slate-400" />
                  <p className="text-sm font-medium text-slate-700">Chưa có cuộc trò chuyện nào</p>
                </div>
              ) : null}

              {sortedTickets.map((ticket) => {
                const lastMessage = getLastMessage(ticket);
                const isActive = selectedTicketId === ticket.id && !showComposer;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(ticket.id);
                      setShowComposer(false);
                    }}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      isActive ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{ticket.shop?.name || ticket.subject}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">{lastMessage?.message || ticket.subject}</p>
                      </div>
                      <Badge variant="outline">{statusLabel[ticket.status] ?? ticket.status}</Badge>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">{formatShortDateTime(lastMessage?.createdAt ?? ticket.updatedAt, "")}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex min-w-0 flex-col">
            {showComposer ? (
              <form onSubmit={createConversation} className="flex h-full flex-col">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-orange-50 text-[#ee4d2d]">
                      <Store className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-950">
                        {paramShopId ? paramShopName || `Shop #${paramShopId}` : "Chưa chọn shop"}
                      </p>
                      {paramOrderId ? <p className="text-sm text-slate-500">Liên quan đơn hàng #{paramOrderId}</p> : null}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto p-5">
                  {paramProductName ? (
                    <div className="flex items-center gap-3 rounded-3xl border border-orange-100 bg-orange-50 p-4 text-sm text-slate-700">
                      <Package className="size-5 shrink-0 text-[#ee4d2d]" />
                      <span className="min-w-0 truncate">{paramProductName}</span>
                    </div>
                  ) : null}

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Chủ đề</span>
                    <input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      placeholder="Ví dụ: Hỏi về sản phẩm"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Tin nhắn</span>
                    <Textarea
                      value={firstMessage}
                      onChange={(event) => setFirstMessage(event.target.value)}
                      rows={6}
                      className="min-h-36 resize-none bg-white"
                      placeholder="Nhập nội dung bạn muốn trao đổi với shop..."
                    />
                  </label>
                </div>

                <div className="flex justify-end border-t border-slate-200 p-5">
                  <Button type="submit" disabled={createTicket.isPending || !paramShopId || firstMessage.trim().length < 2}>
                    <Send className="size-4" />
                    {createTicket.isPending ? "Đang mở..." : "Gửi cho shop"}
                  </Button>
                </div>
              </form>
            ) : selectedTicket ? (
              <>
                <div className="border-b border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-full bg-orange-50 text-[#ee4d2d]">
                        <MessageCircle className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-slate-950">
                          {selectedTicket.shop?.name || selectedTicket.subject}
                        </p>
                        <p className="truncate text-sm text-slate-500">{selectedTicket.subject}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{statusLabel[selectedTicket.status] ?? selectedTicket.status}</Badge>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5">
                  {selectedTicket.messages.map((message: SupportMessage) => {
                    const isMine = message.senderRole === "CUSTOMER";
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm shadow-sm ${
                            isMine ? "bg-[#ee4d2d] text-white" : "bg-white text-slate-900 ring-1 ring-slate-200"
                          }`}
                        >
                          <p className="mb-1 text-xs opacity-75">{senderLabel[message.senderRole] ?? message.senderRole}</p>
                          <p className="whitespace-pre-wrap wrap-break-word leading-6">{message.message}</p>
                          <p className="mt-2 text-[11px] opacity-70">{formatShortDateTime(message.createdAt, "")}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end">
                    <Textarea
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          void sendReply();
                        }
                      }}
                      rows={3}
                      className="min-h-20 resize-none bg-white"
                      placeholder="Nhập tin nhắn..."
                    />
                    <Button type="button" onClick={sendReply} disabled={!reply.trim() || addMessage.isPending} className="md:h-11">
                      <Send className="size-4" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-8">
                <div className="max-w-sm text-center">
                  <MessageCircle className="mx-auto mb-4 size-10 text-slate-400" />
                  <p className="text-lg font-semibold text-slate-950">Chọn một cuộc trò chuyện</p>
                  <p className="mt-2 text-sm text-slate-500">Các tin nhắn với shop sẽ hiển thị tại đây.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
