import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendChatbotMessage } from "@/modules/chatbot/api/send-message";
import type { ChatbotProduct } from "@/modules/chatbot/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: string[];
  products?: ChatbotProduct[];
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Minh co the goi y san pham, tim hang, kiem tra gio hang va don hang trong MarketHub.",
    suggestions: ["Goi y san pham cho toi", "Kiem tra gio hang", "Don hang cua toi"],
  },
];

const priceFormatter = new Intl.NumberFormat("vi-VN");

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getImageUrl = (product: ChatbotProduct) => product.imageUrl || "/placeholder.png";

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const mutation = useSendChatbotMessage();

  const currentProductId = useMemo(() => {
    const match = location.pathname.match(/^\/product\/(\d+)/);
    return match ? Number(match[1]) : undefined;
  }, [location.pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const submitMessage = (value: string) => {
    const text = value.trim();
    if (!text || mutation.isPending) {
      return;
    }

    setMessages((current) => [...current, { id: makeId(), role: "user", content: text }]);
    setDraft("");

    mutation.mutate(
      { message: text, productId: currentProductId },
      {
        onSuccess: (response) => {
          setMessages((current) => [
            ...current,
            {
              id: makeId(),
              role: "assistant",
              content: response.answer,
              suggestions: response.suggestions,
              products: response.products,
            },
          ]);
        },
        onError: () => {
          setMessages((current) => [
            ...current,
            {
              id: makeId(),
              role: "assistant",
              content: "Hien chua the tra loi. Ban thu lai sau it phut.",
              suggestions: ["Goi y san pham cho toi", "Tim san pham gia tot"],
            },
          ]);
        },
      },
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitMessage(draft);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(draft);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {open && (
        <section className="w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl sm:w-[390px]">
          <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-orange-600 text-white">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">MarketHub AI</p>
                <p className="text-xs text-slate-500">Tra loi ngan gon trong pham vi app</p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Dong chatbot">
              <X className="size-4" />
            </Button>
          </div>

          <div ref={scrollRef} className="max-h-[430px] space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[82%] rounded-2xl bg-orange-600 px-3 py-2 text-sm text-white"
                      : "max-w-[90%] rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-slate-800"
                  }
                >
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium opacity-80">
                    {message.role === "assistant" ? <Bot className="size-3.5" /> : null}
                    {message.role === "assistant" ? "Tro ly" : "Ban"}
                  </div>
                  <p className="leading-5">{message.content}</p>

                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => setOpen(false)}
                          className="flex gap-2 rounded-xl bg-white p-2 text-slate-900 shadow-sm ring-1 ring-orange-100 transition hover:ring-orange-300"
                        >
                          <img
                            src={getImageUrl(product)}
                            alt={product.name}
                            className="size-12 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-1 text-xs font-semibold">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.categoryName || product.shopName || "MarketHub"}</p>
                            <p className="text-xs font-bold text-orange-600">{priceFormatter.format(product.price)}d</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && message.role === "assistant" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.slice(0, 3).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submitMessage(suggestion)}
                          className="rounded-full border border-orange-200 bg-white px-2.5 py-1 text-xs text-orange-700 hover:bg-orange-100"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {mutation.isPending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-3 py-2 text-sm text-slate-600">
                  <Loader2 className="size-4 animate-spin" />
                  Dang tra loi...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-orange-100 p-3">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hoi ve san pham, don hang, gio hang..."
              className="max-h-24 min-h-10 rounded-2xl py-2"
            />
            <Button type="submit" size="icon" disabled={!draft.trim() || mutation.isPending} aria-label="Gui tin nhan">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="icon-lg"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Dong chatbot" : "Mo chatbot"}
        className="size-13 rounded-full bg-orange-600 text-white shadow-xl hover:bg-orange-700"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}
