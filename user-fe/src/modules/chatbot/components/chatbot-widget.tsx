import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSendChatbotMessage } from "@/modules/chatbot/api/send-message";
import type { ChatbotHistoryMessage, ChatbotProduct, ChatbotSource } from "@/modules/chatbot/types";
import { useTrackProductBehavior } from "@/modules/recommendation/hooks/useTrackProductBehavior";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  suggestions?: string[];
  products?: ChatbotProduct[];
  sources?: ChatbotSource[];
}

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Chào bạn, mình là trợ lý MarketHub. Bạn cần tìm sản phẩm, hỏi đơn hàng hay xem chính sách đổi trả thì nhắn mình nhé.",
    suggestions: ["Tìm sản phẩm dưới 500k", "Kiểm tra đơn hàng", "Chính sách đổi trả"],
  },
];

const priceFormatter = new Intl.NumberFormat("vi-VN");

// Local knowledge base for common questions
const localKnowledgeBase: Record<string, { answer: string; suggestions?: string[] }> = {
  "chính sách đổi trả": {
    answer: "MarketHub hỗ trợ đổi trả trong vòng 7 ngày làm việc khi sản phẩm bị lỗi, không đúng mô tả hoặc có vấn đề cần shop/admin kiểm tra. Bạn vào trang chi tiết đơn hàng, chọn sản phẩm cần trả, nhập lý do và gửi bằng chứng như ảnh hoặc video. Sau khi yêu cầu được xem xét, hệ thống sẽ cập nhật trạng thái trả hàng và hoàn tiền tương ứng.",
    suggestions: ["Làm sao để trả hàng?", "Chính sách hoàn tiền"],
  },
  "đổi trả": {
    answer: "Bạn có thể tạo yêu cầu trả hàng trong vòng 7 ngày làm việc nếu sản phẩm bị lỗi hoặc không đúng mô tả. Cách làm là vào Đơn hàng, mở chi tiết đơn, chọn sản phẩm cần trả rồi bấm Yêu cầu trả hàng. Bạn nên ghi rõ lý do và đính kèm bằng chứng để shop/admin xử lý nhanh hơn.",
    suggestions: ["Kiểm tra đơn hàng", "Chính sách hoàn tiền"],
  },
  "hoàn tiền": {
    answer: "Hoàn tiền sẽ được xử lý sau khi yêu cầu trả hàng được duyệt theo quy trình của hệ thống. Seller/admin sẽ kiểm tra lý do, bằng chứng và trạng thái đơn trước khi xác nhận hoàn tiền. Thời gian nhận tiền có thể phụ thuộc phương thức thanh toán, nhưng bạn có thể theo dõi tiến độ ngay trong chi tiết yêu cầu trả hàng.",
    suggestions: ["Chính sách đổi trả"],
  },
  "vận chuyển": {
    answer: "MarketHub hiển thị phí vận chuyển ở bước checkout dựa trên địa chỉ nhận hàng, sản phẩm trong đơn và cấu hình vận chuyển của shop. Hiện hệ thống có thông điệp miễn phí vận chuyển cho đơn từ 500.000đ, nhưng điều kiện cụ thể vẫn nên kiểm tra trực tiếp ở trang thanh toán. Sau khi tạo đơn, bạn có thể theo dõi tiến độ giao hàng trong phần chi tiết đơn.",
    suggestions: ["Phí vận chuyển", "Theo dõi đơn hàng"],
  },
  "phí vận chuyển": {
    answer: "Phí vận chuyển được tính tại checkout theo địa chỉ nhận hàng, tổng sản phẩm và phương thức giao hàng khả dụng. Nếu phí chưa hiện đúng, bạn nên kiểm tra lại địa chỉ, số điện thoại và các sản phẩm trong giỏ. Khi đơn đủ điều kiện ưu đãi, hệ thống sẽ tự áp dụng hoặc hiển thị thông tin giảm phí ở bước thanh toán.",
    suggestions: ["Vận chuyển"],
  },
  "thanh toán": {
    answer: "MarketHub hỗ trợ nhiều phương thức thanh toán như thẻ ngân hàng, ví MoMo, VNPay và thanh toán khi nhận hàng (COD). Với MoMo/VNPay, đơn chỉ được ghi nhận thanh toán thành công khi cổng thanh toán trả kết quả về hệ thống. Nếu thanh toán lỗi hoặc hết hạn, bạn có thể quay lại đơn hàng để thử lại hoặc chọn phương thức khác.",
    suggestions: ["Các phương thức thanh toán"],
  },
  "phương thức thanh toán": {
    answer: "Bạn có thể thanh toán bằng thẻ ATM/VISA/MasterCard, ví MoMo, VNPay QR hoặc COD. Nếu muốn xử lý nhanh, thanh toán online sẽ giúp đơn được ghi nhận trạng thái thanh toán rõ ràng hơn. Nếu muốn kiểm tra hàng trước khi trả tiền, COD là lựa chọn phù hợp nhưng vẫn phụ thuộc cấu hình của shop và đơn hàng.",
    suggestions: ["Thanh toán"],
  },
  "tài khoản": {
    answer: "Bạn cần đăng nhập để đặt hàng, xem đơn hàng, lưu sản phẩm yêu thích và nhận gợi ý cá nhân hóa chính xác hơn. Hãy nhấn Đăng nhập ở góc trên bên phải, sau đó nhập email và mật khẩu. Nếu bạn muốn bán hàng, hãy đăng nhập trước rồi gửi hồ sơ mở Kênh người bán.",
    suggestions: ["Đăng ký tài khoản"],
  },
  "đăng ký": {
    answer: "Bạn có thể tạo tài khoản bằng cách vào trang đăng nhập rồi chọn Đăng ký. Hãy điền email, mật khẩu, họ tên và số điện thoại để hệ thống tạo hồ sơ người dùng. Sau khi đăng nhập, bạn có thể đặt hàng, theo dõi đơn, dùng wishlist và gửi hồ sơ người bán nếu cần.",
    suggestions: ["Đăng nhập"],
  },
  "khuyến mãi": {
    answer: "MarketHub có các chương trình khuyến mãi như voucher, flash sale, banner ưu đãi và miễn phí vận chuyển khi đủ điều kiện. Bạn có thể nhập mã voucher tại trang thanh toán để hệ thống kiểm tra điều kiện áp dụng. Nếu mã không dùng được, thường là do đơn chưa đạt giá trị tối thiểu, sai danh mục hoặc voucher đã hết hạn.",
    suggestions: ["Kiểm tra khuyến mãi"],
  },
  "voucher": {
    answer: "Bạn nhập mã voucher ở bước thanh toán để được giảm giá nếu đơn hàng đủ điều kiện. Mỗi voucher có thể giới hạn theo thời gian, danh mục, shop, giá trị đơn tối thiểu hoặc số lượt sử dụng. Nếu voucher không áp dụng, hãy thử kiểm tra lại điều kiện hoặc chọn mã khác phù hợp hơn.",
    suggestions: ["Khuyến mãi"],
  },
  "liên hệ": {
    answer: "Bạn có thể liên hệ hỗ trợ qua email support@markethub.com hoặc hotline 1900-1234. Khi liên hệ, bạn nên chuẩn bị mã đơn hàng, email tài khoản và mô tả ngắn vấn đề để đội CSKH xử lý nhanh hơn. Nếu vấn đề liên quan sản phẩm hoặc đổi trả, hãy gửi thêm ảnh/video bằng chứng nếu có.",
    suggestions: ["Chính sách"],
  },
  "hỗ trợ": {
    answer: "Đội ngũ CSKH của MarketHub sẵn sàng hỗ trợ các vấn đề về sản phẩm, thanh toán, vận chuyển, đổi trả và tài khoản. Bạn có thể liên hệ qua hotline 1900-1234 hoặc email support@markethub.com. Để được hỗ trợ nhanh, hãy gửi kèm mã đơn hàng hoặc mô tả rõ thao tác bạn đang gặp lỗi.",
    suggestions: ["Liên hệ"],
  },
  "sản phẩm": {
    answer: "MarketHub có nhiều sản phẩm thuộc các danh mục như điện tử, thời trang, gia dụng, mỹ phẩm, sách, đồ chơi và thực phẩm. Bạn có thể tìm bằng từ khóa, lọc theo danh mục hoặc nói rõ ngân sách để mình gợi ý sát hơn. Nếu đang ở trang chi tiết sản phẩm, mình cũng có thể đề xuất các sản phẩm tương tự để bạn so sánh.",
    suggestions: ["Gợi ý sản phẩm", "Sản phẩm bán chạy"],
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
  const hasProductIntent = backendProductTerms.some((term) => normalized.includes(term));
  const referencesCurrentProduct = Boolean(productId) && currentProductTerms.some((term) => normalized.includes(term));
  return hasProductIntent || referencesCurrentProduct || true;
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

    const history: ChatbotHistoryMessage[] = messages
      .filter((message) => message.id !== "welcome")
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

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
      { message: text, productId: currentProductId, history },
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
              sources: response.sources,
            },
          ]);
        },
        onError: () => {
          setMessages((current) => [
            ...current,
            {
              id: makeId(),
              role: "assistant",
              content: "Mình chưa trả lời được lúc này. Bạn thử hỏi lại sau một chút nhé.",
              suggestions: ["Tìm sản phẩm giá tốt", "Kiểm tra đơn hàng", "Chính sách đổi trả"],
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
        <section className="w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-2xl sm:w-97.5">
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

          <div ref={scrollRef} className="max-h-107.5 space-y-3 overflow-y-auto px-4 py-4">
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
                  <p className="whitespace-pre-wrap leading-5">{message.content}</p>

                  {message.sources && message.sources.length > 0 && message.role === "assistant" && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.sources.slice(0, 4).map((source) => (
                        <span
                          key={source.sourceId}
                          className="rounded-full border border-orange-200 bg-white px-2 py-0.5 text-[11px] text-orange-700"
                          title={source.title}
                        >
                          [{source.sourceId}] {source.title}
                        </span>
                      ))}
                    </div>
                  )}

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
