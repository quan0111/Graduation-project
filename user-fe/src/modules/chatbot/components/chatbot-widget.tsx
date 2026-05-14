import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendChatbotMessage } from "@/modules/chatbot/api/send-message";
import type { ChatbotProduct } from "@/modules/chatbot/types";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  suggestions?: string[];
  products?: ChatbotProduct[];
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Chào bạn, mình là trợ lý MarketHub. Mình có thể gợi ý sản phẩm theo thói quen mua sắm, tìm sản phẩm liên quan hoặc hỗ trợ giỏ hàng và đơn hàng.",
    suggestions: ["Gợi ý sản phẩm cho tôi", "Sản phẩm hợp thói quen của tôi", "Kiểm tra giỏ hàng", "Chính sách đổi trả"],
  },
];

const priceFormatter = new Intl.NumberFormat("vi-VN");

// Local knowledge base for common questions
const localKnowledgeBase: Record<string, { answer: string; suggestions?: string[] }> = {
  "chính sách đổi trả": {
    answer: "MarketHub hỗ trợ đổi trả trong vòng 7 ngày làm việc khi sản phẩm bị lỗi hoặc không đúng mô tả. Bạn cần tạo yêu cầu trả hàng từ trang chi tiết đơn hàng.",
    suggestions: ["Làm sao để trả hàng?", "Chính sách hoàn tiền"],
  },
  "đổi trả": {
    answer: "Bạn có thể trả hàng trong vòng 7 ngày làm việc. Vào trang Đơn hàng > chọn đơn hàng > nhấn Yêu cầu trả hàng.",
    suggestions: ["Kiểm tra đơn hàng", "Chính sách hoàn tiền"],
  },
  "hoàn tiền": {
    answer: "Sau khi admin duyệt yêu cầu trả hàng, seller sẽ hoàn tiền cho bạn. Thời gian hoàn tiền thường từ 3-5 ngày làm việc.",
    suggestions: ["Chính sách đổi trả"],
  },
  "vận chuyển": {
    answer: "MarketHub hiển thị phí vận chuyển ở bước checkout theo địa chỉ và đơn hàng. Hệ thống đang có thông điệp miễn phí vận chuyển cho đơn từ 500.000đ.",
    suggestions: ["Phí vận chuyển", "Theo dõi đơn hàng"],
  },
  "phí vận chuyển": {
    answer: "Phí vận chuyển được tính tại checkout theo địa chỉ nhận hàng và sản phẩm trong đơn. Bạn kiểm tra lại ở bước thanh toán để thấy số tiền chính xác.",
    suggestions: ["Vận chuyển"],
  },
  "thanh toán": {
    answer: "MarketHub hỗ trợ thanh toán bằng thẻ ngân hàng, ví MoMo, VNPay và thanh toán khi nhận hàng (COD).",
    suggestions: ["Các phương thức thanh toán"],
  },
  "phương thức thanh toán": {
    answer: "Bạn có thể thanh toán bằng: Thẻ ATM/VISA/MasterCard, Ví MoMo, VNPay QR, hoặc COD (thanh toán khi nhận hàng).",
    suggestions: ["Thanh toán"],
  },
  "tài khoản": {
    answer: "Bạn cần đăng nhập để đặt hàng, xem đơn hàng, và sử dụng các tính năng cá nhân hóa. Nhấn Đăng nhập ở góc trên bên phải.",
    suggestions: ["Đăng ký tài khoản"],
  },
  "đăng ký": {
    answer: "Nhấn Đăng ký ở trang đăng nhập, điền email, mật khẩu và thông tin cá nhân để tạo tài khoản mới.",
    suggestions: ["Đăng nhập"],
  },
  "khuyến mãi": {
    answer: "MarketHub thường xuyên có các chương trình khuyến mãi. Bạn có thể nhập mã voucher tại trang thanh toán để được giảm giá.",
    suggestions: ["Kiểm tra khuyến mãi"],
  },
  "voucher": {
    answer: "Nhập mã voucher tại trang thanh toán để được giảm giá. Mỗi voucher có điều kiện áp dụng riêng biệt.",
    suggestions: ["Khuyến mãi"],
  },
  "liên hệ": {
    answer: "Bạn có thể liên hệ hỗ trợ qua email support@markethub.com hoặc hotline 1900-1234. Đội ngũ CSKH hoạt động 24/7.",
    suggestions: ["Chính sách"],
  },
  "hỗ trợ": {
    answer: "Đội ngũ CSKH của MarketHub sẵn sàng hỗ trợ bạn 24/7. Vui lòng liên hệ qua hotline 1900-1234 hoặc email support@markethub.com.",
    suggestions: ["Liên hệ"],
  },
  "sản phẩm": {
    answer: "MarketHub có hàng nghìn sản phẩm từ các danh mục: Điện tử, Thời trang, Gia dụng, Mỹ phẩm, và nhiều hơn nữa. Bạn có thể tìm kiếm theo danh mục hoặc từ khóa.",
    suggestions: ["Gợi ý sản phẩm", "Sản phẩm bán chạy"],
  },
  "giới thiệu sản phẩm": {
    answer: "Dưới đây là một số sản phẩm nổi bật trên MarketHub:\n\n📱 Điện thoại iPhone 15 Pro Max - Chip A17 Pro, Camera 48MP\n💻 MacBook Air M2 - Mỏng nhẹ, hiệu năng mạnh mẽ\n👟 Nike Air Jordan - Giày thể thao phong cách\n💄 Son MAC Rouge - Màu sắc bền đẹp\n🎧 Tai nghe Sony WH-1000XM5 - Chống ồn đỉnh cao\n\nBạn muốn xem chi tiết sản phẩm nào?",
    suggestions: ["iPhone 15", "MacBook Air", "Nike Jordan"],
  },
  "san pham noi bat": {
    answer: "Sản phẩm nổi bật tháng này:\n\n🌟 iPhone 15 Pro Max - 29.990.000đ\n🌟 MacBook Air M2 - 24.990.000đ\n🌟 Sony WH-1000XM5 - 8.990.000đ\n🌟 Nike Air Jordan 1 - 4.500.000đ\n🌟 Son MAC Ruby Woo - 650.000đ",
    suggestions: ["Gợi ý sản phẩm", "Sản phẩm giá rẻ"],
  },
  "danh mục": {
    answer: "MarketHub có các danh mục sản phẩm:\n\n📱 Điện tử & Điện thoại\n👕 Thời trang\n🏠 Gia dụng\n💄 Mỹ phẩm\n📚 Sách\n🎮 Đồ chơi\n🍪 Thực phẩm",
    suggestions: ["Điện thoại", "Thời trang", "Mỹ phẩm"],
  },
};

const getLocalAnswer = (query: string): { answer: string; suggestions?: string[] } | null => {
  const lowerQuery = query.toLowerCase().trim();
  for (const [key, value] of Object.entries(localKnowledgeBase)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }
  return null;
};

const normalizeChatText = (value: string) =>
  value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const backendProductTerms = [
  "goi y",
  "de xuat",
  "tu van",
  "phu hop",
  "san pham",
  "gia",
  "gia tot",
  "gia re",
  "duoi",
  "toi da",
  "shop",
  "danh muc",
  "mua",
  "tim",
  "tuong tu",
  "lien quan",
  "con hang",
  "ton kho",
  "so sanh",
  "hop thoi quen",
];

const currentProductTerms = ["cai nay", "san pham nay", "mau nay", "mon nay", "co tot", "nen mua"];

const shouldUseBackend = (query: string, productId?: number) => {
  const normalized = normalizeChatText(query);
  if (backendProductTerms.some((term) => normalized.includes(term))) {
    return true;
  }
  return Boolean(productId) && currentProductTerms.some((term) => normalized.includes(term));
};

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
  const { trackClick } = useTrackProductBehavior();

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

    const shouldAskBackend = shouldUseBackend(text, currentProductId);
    const localAnswer = shouldAskBackend ? null : getLocalAnswer(text);
    if (!shouldAskBackend && localAnswer) {
      setMessages((current) => [
        ...current,
        {
          id: makeId(),
          role: "assistant",
          content: localAnswer.answer,
          suggestions: localAnswer.suggestions,
        },
      ]);
      return;
    }

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
              intent: response.intent,
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
              content: "Hiện chưa thể trả lời. Bạn thử lại sau ít phút.",
              suggestions: ["Gợi ý sản phẩm cho tôi", "Tìm sản phẩm giá tốt", "Chính sách đổi trả"],
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
                <p className="text-xs text-slate-500">Trợ lý thông minh 24/7</p>
              </div>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Đóng chatbot">
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
                    {message.role === "assistant" ? "Trợ lý" : "Bạn"}
                  </div>
                  <p className="leading-5">{message.content}</p>

                  {message.products && message.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => {
                            trackClick(product.id, {
                              page: "chatbot",
                              source: "chatbot_recommendation",
                              intent: message.intent,
                              relationType: product.relationType,
                            });
                            setOpen(false);
                          }}
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
                            {product.reason && <p className="line-clamp-2 text-[11px] leading-4 text-slate-600">{product.reason}</p>}
                            <p className="text-xs font-bold text-orange-600">{priceFormatter.format(product.price)}đ</p>
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
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-orange-100 p-3">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi về sản phẩm, đơn hàng, chính sách..."
              className="max-h-24 min-h-10 rounded-2xl py-2"
            />
            <Button type="submit" size="icon" disabled={!draft.trim() || mutation.isPending} aria-label="Gửi tin nhắn">
              {mutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="icon-lg"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Đóng chatbot" : "Mở chatbot"}
        className="size-13 rounded-full bg-orange-600 text-white shadow-xl hover:bg-orange-700"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>
    </div>
  );
}
