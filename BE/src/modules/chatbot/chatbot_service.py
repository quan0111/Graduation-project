from collections import defaultdict
import re
import unicodedata
from typing import Dict, List, Optional, Set

from src.ai.rag_engine import RagEngine, RagSource
from src.ai.recommendation_engine import RecommendationEngine
from src.core.database import prisma
from src.modules.chatbot.chatbot_schema import ChatbotProductOut
from src.modules.chatbot.ollama_client import OllamaClient, OllamaUnavailable
from src.utils.recommendation_reason import product_reason as build_product_reason


class ChatService:
    ANSWER_MAX_LENGTH = 1200
    PRODUCT_INCLUDE = {
        "shop": True,
        "category": True,
        "images": True,
        "variants": True,
        "tags": True,
    }
    SCOPE_SUGGESTIONS = [
        "Gợi ý sản phẩm cho tôi",
        "Tìm sản phẩm giá tốt",
        "Kiểm tra giỏ hàng",
    ]
    PRODUCT_SUGGESTIONS = [
        "Gợi ý sản phẩm tương tự",
        "Sản phẩm hợp thói quen của tôi",
        "Tìm sản phẩm giá tốt",
    ]
    STOP_WORDS = {
        "toi",
        "minh",
        "ban",
        "can",
        "muon",
        "tim",
        "kiem",
        "san",
        "pham",
        "hang",
        "cho",
        "voi",
        "cua",
        "co",
        "khong",
        "nao",
        "gi",
        "la",
        "ve",
    }

    @classmethod
    async def answer(
        cls,
        message: str,
        user_id: Optional[int] = None,
        product_id: Optional[int] = None,
        history: Optional[List] = None,
    ):
        clean_message = message.strip()
        normalized = cls._normalize(clean_message)

        if not normalized:
            return cls._response(
                "Bạn cần mình hỗ trợ gì trên MarketHub? Mình có thể tìm sản phẩm, gợi ý theo ngân sách, kiểm tra giỏ hàng hoặc giải thích trạng thái đơn.",
                "empty",
            )

        if cls._is_out_of_scope(normalized):
            return cls._response(
                "Mình chỉ hỗ trợ các nội dung của MarketHub như sản phẩm, giỏ hàng, đơn hàng, thanh toán, vận chuyển, đổi trả và kênh người bán. Bạn nói rõ nhu cầu mua sắm hoặc mã đơn cần kiểm tra nhé.",
                "out_of_scope",
            )

        intent = cls._detect_intent(normalized)
        context = await cls._build_context(intent, clean_message, user_id, product_id, history or [])

        if intent in {"recommend", "product_search"} and context.get("products"):
            try:
                answer = await cls._ask_ollama(clean_message, context["context_lines"])
                if cls._looks_like_reasoning(answer):
                    answer = cls._product_recommendation_answer(intent, context)
            except OllamaUnavailable:
                answer = cls._product_recommendation_answer(intent, context)

            return cls._response(
                answer,
                intent,
                context.get("suggestions") or cls.PRODUCT_SUGGESTIONS,
                context.get("products") or [],
                context.get("sources") or [],
            )

        try:
            answer = await cls._ask_ollama(clean_message, context["context_lines"])
            if cls._looks_like_reasoning(answer):
                answer = cls._fallback_answer(intent, context, "Ollama returned reasoning instead of final answer")
        except OllamaUnavailable as exc:
            answer = cls._fallback_answer(intent, context, str(exc))

        return cls._response(
            answer,
            intent,
            context.get("suggestions") or cls.SCOPE_SUGGESTIONS,
            context.get("products") or [],
            context.get("sources") or [],
        )

    @classmethod
    async def chat(cls, message: str):
        result = await cls.answer(message)
        return result["answer"]

    @staticmethod
    def _history_context_lines(history: List) -> List[str]:
        if not history:
            return []

        lines = ["Lịch sử hội thoại gần đây:"]
        for item in history[-8:]:
            role = getattr(item, "role", None) or (item.get("role") if isinstance(item, dict) else "")
            content = getattr(item, "content", None) or (item.get("content") if isinstance(item, dict) else "")
            if role not in {"user", "assistant"} or not content:
                continue
            label = "Người dùng" if role == "user" else "Trợ lý"
            lines.append(f"{label}: {str(content).strip()[:220]}")

        return lines if len(lines) > 1 else []

    @classmethod
    async def _ask_ollama(cls, question: str, context_lines: List[str]) -> str:
        context_text = "\n".join(f"- {cls._repair_mojibake(line)}" for line in context_lines[:32])
        if not context_text:
            context_text = "- Không có dữ liệu phù hợp trong hệ thống."

        messages = [
            {
                "role": "system",
                "content": (
                    "Bạn là trợ lý mua sắm của MarketHub. "
                    "Trả lời tự nhiên như nhân viên tư vấn online, xưng mình/bạn, thân thiện nhưng không lan man. "
                    "Chỉ dùng dữ liệu trong CONTEXT; không tự bịa giá, tồn kho, chính sách hoặc trạng thái đơn. "
                    "Không nhắc chữ CONTEXT, không mở đầu bằng kiểu 'dựa trên dữ liệu hệ thống' nếu không cần. "
                    "Ưu tiên 1-2 câu ngắn; nếu cần hướng dẫn thì dùng tối đa 3 gạch đầu dòng. "
                    "Khi gợi ý sản phẩm, nêu tên sản phẩm, giá nếu có và lý do chọn thật ngắn. "
                    "Nếu thiếu dữ liệu, nói thiếu gì và hỏi lại đúng một câu. "
                    "Không tự thêm dòng Nguồn vì giao diện đã hiển thị nguồn riêng."
                ),
            },
            {
                "role": "user",
                "content": f"CONTEXT:\n{context_text}\n\nCÂU HỎI:\n{question}",
            },
        ]

        raw_answer = await OllamaClient.chat(messages)
        return cls._clean_model_answer(raw_answer)

    @classmethod
    async def _build_context(
        cls,
        intent: str,
        message: str,
        user_id: Optional[int],
        product_id: Optional[int],
        history: List,
    ):
        context_lines = [
            "MarketHub là website ecommerce trong đồ án.",
            "Các chức năng chính: xem sản phẩm, tìm kiếm sản phẩm, giỏ hàng, checkout, đơn hàng, seller center.",
        ]
        context_lines.extend(cls._history_context_lines(history))
        rag_sources = await RagEngine.retrieve(message, user_id=user_id, product_id=product_id, top_k=8)
        if rag_sources:
            context_lines.append("Nguồn RAG đã truy xuất:")
            context_lines.extend(cls._rag_context_lines(rag_sources))
        products: List[ChatbotProductOut] = []
        suggestions = cls.SCOPE_SUGGESTIONS
        needs_current_product = bool(product_id) and intent in {"recommend", "product_search", "general"}
        current_product = await cls._get_current_product(product_id) if needs_current_product else None
        needs_preferences = intent in {"recommend", "product_search"}
        preferences = (
            await cls._build_preference_snapshot(user_id)
            if user_id is not None and needs_preferences
            else cls._empty_preference_snapshot()
        )

        if preferences.get("summary"):
            context_lines.append(preferences["summary"])

        if current_product:
            context_lines.append("Sản phẩm người dùng đang xem:")
            context_lines.extend(cls._product_context_lines([current_product]))

        if intent in {"recommend", "product_search"}:
            matched_products = await cls._find_products_for_message(message, user_id, product_id, prefer_recommend=intent == "recommend")
            products = cls._serialize_products(matched_products, preferences, current_product)
            if products:
                reason_map = {product.id: product.reason for product in products}
                context_lines.append("Sản phẩm liên quan trong hệ thống:")
                context_lines.extend(cls._product_context_lines(matched_products, reason_map))
                suggestions = cls._product_followup_suggestions(products)

        if intent == "cart":
            context_lines.extend(await cls._cart_context_lines(user_id))
            suggestions = ["Xem đơn hàng của tôi", "Gợi ý sản phẩm", "Hỏi về thanh toán"]

        if intent == "order_guide":
            context_lines.append("Cách đặt hàng: chọn sản phẩm, chọn phân loại/số lượng, thêm vào giỏ hoặc mua ngay, chọn địa chỉ, áp mã giảm giá nếu có, chọn thanh toán rồi xác nhận đặt hàng.")
            context_lines.append("Sau khi đặt, đơn đi qua các trạng thái: chờ xác nhận, đã xác nhận, đang xử lý, chờ lấy hàng, đang vận chuyển, đã giao và hoàn tất.")
            suggestions = ["Các phương thức thanh toán", "Kiểm tra đơn hàng", "Mã khuyến mãi hiện có"]

        if intent == "orders":
            context_lines.extend(await cls._order_context_lines(user_id))
            suggestions = ["Kiểm tra giỏ hàng", "Hỏi về vận chuyển", "Gợi ý sản phẩm"]

        if intent == "order_cancel":
            context_lines.extend(await cls._order_context_lines(user_id))
            context_lines.append("Hủy đơn: người dùng thao tác trong chi tiết đơn khi trạng thái còn cho phép. Nếu đơn đã gửi/giao, người dùng không hủy trực tiếp mà theo dõi giao hàng hoặc tạo yêu cầu trả hàng.")
            context_lines.append("Với đơn thanh toán online, nếu đã thanh toán thì cần xử lý hoàn tiền trước khi đóng hủy/hoàn.")
            suggestions = ["Xem đơn hàng của tôi", "Chính sách hoàn tiền", "Yêu cầu trả hàng"]

        if intent == "payment":
            context_lines.append("MarketHub hỗ trợ COD, MoMo QR, VNPay QR và Stripe tại bước checkout.")
            context_lines.append("Với MoMo/VNPay, đơn chỉ chuyển sang đã thanh toán khi cổng thanh toán trả kết quả thành công; COD có thể được seller xác nhận và xử lý trực tiếp.")
            suggestions = ["Cách đặt hàng", "Hỏi về vận chuyển", "Xem đơn hàng"]

        if intent == "shipping":
            context_lines.append("Phí vận chuyển được tính tại checkout theo địa chỉ và đơn hàng.")
            context_lines.append("Thanh top bar hiện thông điệp miễn phí vận chuyển cho đơn hàng trên 500k.")
            suggestions = ["Hỏi về thanh toán", "Kiểm tra giỏ hàng", "Gợi ý sản phẩm"]

        if intent == "tracking":
            context_lines.extend(await cls._order_context_lines(user_id))
            context_lines.append("Theo dõi vận chuyển: seller cần nhập đơn vị vận chuyển và mã vận đơn khi chuyển đơn sang đã gửi hàng.")
            context_lines.append("Khi đơn đã bàn giao/gửi hàng, mã vận đơn bị khóa để tránh sửa sai lịch sử vận chuyển.")
            suggestions = ["Xem đơn hàng của tôi", "Hỏi về vận chuyển", "Đã nhận hàng"]

        if intent == "auth":
            context_lines.append("Đăng ký: mở trang Đăng ký, nhập email, mật khẩu, họ tên và số điện thoại rồi xác nhận.")
            context_lines.append("Đăng nhập: mở trang Đăng nhập, nhập email và mật khẩu. Nếu tài khoản bị khóa, hệ thống sẽ báo rõ và người dùng cần liên hệ hỗ trợ.")
            context_lines.append("Người bán cần đăng nhập tài khoản khách hàng trước, sau đó gửi hồ sơ mở Kênh người bán để admin duyệt.")
            suggestions = ["Cách đặt hàng", "Mở Kênh người bán", "Quên mật khẩu"]

        if intent == "promotion":
            context_lines.append("Khuyến mãi trên MarketHub gồm mã giảm giá/voucher, banner marketing và ưu đãi vận chuyển nếu đủ điều kiện.")
            context_lines.append("Người dùng nhập mã voucher ở bước checkout; hệ thống kiểm tra điều kiện trước khi trừ tiền.")
            suggestions = ["Cách dùng voucher", "Cách đặt hàng", "Gợi ý sản phẩm giá tốt"]

        if intent == "flash_sale":
            context_lines.append("Flash sale chỉ áp dụng trong khung giờ hợp lệ, còn quota và còn tồn kho biến thể.")
            context_lines.append("Checkout cần dùng đúng giá flash sale đang hiệu lực; nếu hết hạn hoặc hết quota thì không mua được theo giá flash sale.")
            suggestions = ["Tìm sản phẩm flash sale", "Kiểm tra tồn kho", "Cách dùng voucher"]

        if intent == "return_policy":
            context_lines.append("Người dùng có thể gửi yêu cầu trả hàng từ chi tiết đơn, chọn sản phẩm cần trả, nhập lý do và bằng chứng.")
            context_lines.append("Admin/seller xem xét yêu cầu; nếu được duyệt, quy trình hoàn tiền được xử lý theo trạng thái trả hàng.")
            suggestions = ["Xem đơn hàng của tôi", "Cách gửi bằng chứng", "Hỏi về hoàn tiền"]

        if intent == "review":
            context_lines.append("Đánh giá sản phẩm: người dùng chỉ đánh giá sau khi đơn đã giao/hoàn tất và có sản phẩm thuộc đơn đó.")
            context_lines.append("Nếu đơn chưa được xác nhận đã nhận hàng hoặc chưa hoàn tất, nút đánh giá chưa nên mở.")
            suggestions = ["Xem đơn hàng của tôi", "Đã nhận hàng", "Chính sách đổi trả"]

        if intent == "wishlist":
            context_lines.append("Wishlist/yêu thích giúp người dùng lưu sản phẩm để xem lại sau và hỗ trợ hệ thống gợi ý cá nhân hóa tốt hơn.")
            context_lines.append("Người dùng cần đăng nhập để đồng bộ danh sách yêu thích giữa các phiên.")
            suggestions = ["Gợi ý sản phẩm cho tôi", "Tìm sản phẩm tương tự", "Kiểm tra giỏ hàng"]

        if intent == "stock":
            context_lines.append("Tồn kho hiển thị theo biến thể sản phẩm. Biến thể hết hàng không nên cho chọn để thêm vào giỏ.")
            context_lines.append("Khi checkout, backend vẫn phải kiểm tra lại tồn kho/flash sale quota để tránh mua quá số lượng.")
            suggestions = ["Tìm sản phẩm còn hàng", "Sản phẩm tương tự", "Kiểm tra giỏ hàng"]

        if intent == "seller":
            context_lines.append("Người dùng có thể mở Kênh người bán, gửi thông tin shop và chờ admin duyệt.")
            context_lines.append("Seller Center có quản lý sản phẩm, đơn hàng, dashboard và thống kê.")
            suggestions = ["Mở Kênh người bán", "Quản lý sản phẩm", "Kiểm tra đơn hàng"]

        if intent == "greeting":
            suggestions = ["Gợi ý sản phẩm cho tôi", "Tìm sản phẩm giá tốt", "Chính sách đổi trả"]

        return {
            "context_lines": context_lines,
            "products": products,
            "suggestions": suggestions,
            "preferences": preferences,
            "current_product": current_product,
            "sources": cls._serialize_sources(rag_sources),
        }

    @staticmethod
    def _rag_context_lines(sources: List[RagSource]) -> List[str]:
        lines = []
        for source in sources:
            lines.append(f"[{source.source_id}] {source.title}: {source.content}")
        return lines

    @staticmethod
    def _serialize_sources(sources: List[RagSource]) -> List[Dict]:
        serialized_sources = []
        for source in sources:
            serialized_sources.append(
                {
                    "sourceId": source.source_id,
                    "title": source.title,
                    "type": source.kind,
                    "score": round(float(source.score), 4),
                    "productId": source.metadata.get("productId"),
                    "route": source.metadata.get("route"),
                }
            )
        return serialized_sources

    @classmethod
    async def _find_products_for_message(
        cls,
        message: str,
        user_id: Optional[int],
        product_id: Optional[int],
        prefer_recommend: bool,
    ):
        budget = cls._extract_budget(message)
        if prefer_recommend:
            product_ids, _algorithm = await RecommendationEngine.recommend_product_ids(
                user_id=user_id,
                top_k=4,
                context_product_id=product_id,
                query=message,
            )
            products = await cls._products_by_rank(product_ids)
            return cls._apply_budget_filter(products, budget)[:4]

        product_ids, _algorithm = await RecommendationEngine.recommend_product_ids(
            user_id=user_id,
            top_k=12,
            context_product_id=product_id,
            query=message,
            exclude_seen=False,
        )
        ranked_products = cls._apply_budget_filter(await cls._products_by_rank(product_ids), budget)
        if ranked_products:
            return ranked_products[:4]

        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include=cls.PRODUCT_INCLUDE,
            take=140,
        )
        terms = cls._extract_terms(message)
        scored_products = []

        for product in products:
            score = cls._score_product_match(product, terms)
            score += cls._score_budget_match(product, budget)
            if score > 0:
                scored_products.append((score, product))

        scored_products.sort(key=lambda pair: pair[0], reverse=True)
        return [product for _, product in scored_products[:4]]

    @staticmethod
    def _apply_budget_filter(products, budget: Optional[float]):
        if not budget:
            return products
        matched = [product for product in products if float(getattr(product, "price", 0) or 0) <= budget]
        return matched or products

    @classmethod
    async def _get_current_product(cls, product_id: int):
        return await prisma.product.find_unique(
            where={"id": product_id},
            include=cls.PRODUCT_INCLUDE,
        )

    @classmethod
    async def _products_by_rank(cls, product_ids: List[int]):
        if not product_ids:
            return []

        products = await prisma.product.find_many(
            where={"id": {"in": product_ids}, "status": "ACTIVE", "deletedAt": None},
            include=cls.PRODUCT_INCLUDE,
        )
        product_map = {product.id: product for product in products}
        return [product_map[product_id] for product_id in product_ids if product_id in product_map]

    @staticmethod
    def _empty_preference_snapshot():
        return {
            "category_ids": set(),
            "shop_ids": set(),
            "tags": set(),
            "average_price": 0.0,
            "summary": None,
        }

    @classmethod
    async def _build_preference_snapshot(cls, user_id: int):
        snapshot = cls._empty_preference_snapshot()
        category_scores: Dict[int, float] = defaultdict(float)
        category_names: Dict[int, str] = {}
        shop_scores: Dict[int, float] = defaultdict(float)
        shop_names: Dict[int, str] = {}
        tag_scores: Dict[str, float] = defaultdict(float)
        price_total = 0.0
        weight_total = 0.0

        behaviors = await prisma.userbehavior.find_many(
            where={"userId": user_id, "deletedAt": None},
            include={"product": {"include": {"category": True, "shop": True, "tags": True}}},
            order={"createdAt": "desc"},
            take=50,
        )
        for behavior in behaviors:
            product = getattr(behavior, "product", None)
            if not cls._is_active_product(product):
                continue
            action_value = cls._to_value(behavior.action)
            weight = RecommendationEngine.BEHAVIOR_WEIGHTS.get(action_value, 1.0) * RecommendationEngine._recency_multiplier(
                behavior.createdAt
            )
            price_total, weight_total = cls._add_product_to_snapshot(
                product,
                weight,
                category_scores,
                category_names,
                shop_scores,
                shop_names,
                tag_scores,
                price_total,
                weight_total,
            )

        orders = await prisma.order.find_many(
            where={
                "userId": user_id,
                "deletedAt": None,
                "status": {"notIn": ["PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]},
            },
            order={"createdAt": "desc"},
            take=20,
        )
        order_ids = [order.id for order in orders]
        order_dates = {order.id: order.createdAt for order in orders}
        if order_ids:
            order_items = await prisma.orderitem.find_many(
                where={"orderId": {"in": order_ids}, "deletedAt": None},
                include={"product": {"include": {"category": True, "shop": True, "tags": True}}},
            )
            for item in order_items:
                product = getattr(item, "product", None)
                if not cls._is_active_product(product):
                    continue
                quantity = max(item.quantity or 1, 1)
                weight = (RecommendationEngine.ORDER_WEIGHT + min(quantity, 5) * 0.5) * RecommendationEngine._recency_multiplier(
                    order_dates.get(item.orderId)
                )
                price_total, weight_total = cls._add_product_to_snapshot(
                    product,
                    weight,
                    category_scores,
                    category_names,
                    shop_scores,
                    shop_names,
                    tag_scores,
                    price_total,
                    weight_total,
                )

        if weight_total <= 0:
            return snapshot

        top_categories = [category_id for category_id, _ in sorted(category_scores.items(), key=lambda item: item[1], reverse=True)[:3]]
        top_shops = [shop_id for shop_id, _ in sorted(shop_scores.items(), key=lambda item: item[1], reverse=True)[:3]]
        top_tags = [tag for tag, _ in sorted(tag_scores.items(), key=lambda item: item[1], reverse=True)[:5]]
        average_price = price_total / weight_total

        category_labels = [category_names[category_id] for category_id in top_categories if category_id in category_names][:2]
        summary_parts = []
        if category_labels:
            summary_parts.append(f"hay quan tâm {', '.join(category_labels)}")
        if average_price > 0:
            summary_parts.append(f"mức giá quanh {average_price:,.0f} VND")

        snapshot.update(
            {
                "category_ids": set(top_categories),
                "shop_ids": set(top_shops),
                "tags": set(top_tags),
                "average_price": average_price,
                "summary": f"Thói quen gần đây của người dùng: {', '.join(summary_parts)}." if summary_parts else None,
            }
        )
        return snapshot

    @classmethod
    def _add_product_to_snapshot(
        cls,
        product,
        weight: float,
        category_scores,
        category_names,
        shop_scores,
        shop_names,
        tag_scores,
        price_total: float,
        weight_total: float,
    ):
        if weight <= 0:
            return price_total, weight_total

        category = getattr(product, "category", None)
        shop = getattr(product, "shop", None)
        category_scores[product.categoryId] += weight
        shop_scores[product.shopId] += weight
        if category:
            category_names[product.categoryId] = category.name
        if shop:
            shop_names[product.shopId] = shop.name

        for tag in getattr(product, "tags", []) or []:
            tag_name = getattr(tag, "name", None)
            if tag_name:
                tag_scores[cls._normalize(tag_name)] += weight

        return price_total + float(product.price or 0) * weight, weight_total + weight

    @classmethod
    async def _cart_context_lines(cls, user_id: Optional[int]) -> List[str]:
        if user_id is None:
            return ["Người dùng chưa đăng nhập nên không thể xem giỏ hàng cá nhân."]

        cart = await prisma.cart.find_unique(where={"userId": user_id}, include={"items": True})
        items = getattr(cart, "items", []) if cart else []
        total_quantity = sum(max(item.quantity or 0, 0) for item in items)
        if total_quantity == 0:
            return ["Giỏ hàng của người dùng đang trống."]
        return [f"Giỏ hàng hiện có {total_quantity} sản phẩm."]

    @classmethod
    async def _order_context_lines(cls, user_id: Optional[int]) -> List[str]:
        if user_id is None:
            return ["Người dùng chưa đăng nhập nên không thể xem đơn hàng cá nhân."]

        orders = await prisma.order.find_many(
            where={
                "userId": user_id,
                "deletedAt": None,
                "status": {"notIn": ["PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]},
            },
            order={"createdAt": "desc"},
            take=3,
        )
        if not orders:
            return ["Người dùng chưa có đơn hàng gần đây."]

        lines = ["Đơn hàng gần đây:"]
        for order in orders:
            lines.append(f"Đơn #{order.id}: trạng thái {cls._to_value(order.status)}, tổng tiền {float(order.totalAmount or 0):,.0f} VND.")
        return lines

    @classmethod
    def _serialize_products(cls, products, preferences, current_product=None) -> List[ChatbotProductOut]:
        serialized_products = []
        for product in products:
            if not cls._is_active_product(product):
                continue
            reason, relation_type = cls._product_reason(product, preferences, current_product)
            serialized_products.append(
                ChatbotProductOut(
                    id=product.id,
                    name=product.name,
                    price=float(product.price or 0),
                    imageUrl=cls._primary_image(product),
                    shopName=getattr(getattr(product, "shop", None), "name", None),
                    categoryName=getattr(getattr(product, "category", None), "name", None),
                    reason=reason,
                    relationType=relation_type,
                )
            )
        return serialized_products

    @classmethod
    def _product_context_lines(cls, products, reason_map: Optional[Dict[int, str]] = None) -> List[str]:
        lines = []
        for product in products[:5]:
            stock = sum(max(getattr(variant, "stock", 0) or 0, 0) for variant in getattr(product, "variants", []) or [])
            category = getattr(getattr(product, "category", None), "name", None) or "Chưa có danh mục"
            shop = getattr(getattr(product, "shop", None), "name", None) or "Chưa có shop"
            reason = f"; lý do đề xuất: {reason_map[product.id]}" if reason_map and reason_map.get(product.id) else ""
            lines.append(f"#{product.id} {product.name}; giá {float(product.price or 0):,.0f} VND; danh mục {category}; shop {shop}; tồn kho {stock}{reason}.")
        return lines

    @classmethod
    def _product_reason(cls, product, preferences, current_product=None):
        return build_product_reason(product, preferences, current_product)
        category = getattr(getattr(product, "category", None), "name", None)
        shop = getattr(getattr(product, "shop", None), "name", None)

        if current_product:
            shared_tags = cls._shared_tags(product, current_product)
            if shared_tags:
                return f"Có cùng tag {', '.join(shared_tags[:2])} với sản phẩm bạn đang xem.", "shared_tags"
            if product.categoryId == current_product.categoryId and category:
                return f"Cùng danh mục {category} với sản phẩm bạn đang xem.", "same_category"
            if product.shopId == current_product.shopId and shop:
                return f"Cùng shop {shop}, dễ xem thêm lựa chọn liên quan.", "same_shop"

            current_price = float(getattr(current_product, "price", 0) or 0)
            product_price = float(getattr(product, "price", 0) or 0)
            if current_price > 0 and product_price > 0:
                price_gap = abs(product_price - current_price) / max(current_price, 1)
                if price_gap <= 0.25:
                    return "Mức giá gần với sản phẩm bạn đang cân nhắc.", "similar_price"

        category_ids: Set[int] = preferences.get("category_ids") or set()
        shop_ids: Set[int] = preferences.get("shop_ids") or set()
        preferred_tags: Set[str] = preferences.get("tags") or set()
        average_price = float(preferences.get("average_price") or 0)
        product_tags = {cls._normalize(getattr(tag, "name", "")) for tag in getattr(product, "tags", []) or []}

        if product.categoryId in category_ids and category:
            return f"Hợp với nhóm {category} bạn hay xem hoặc mua gần đây.", "user_category"
        if product_tags & preferred_tags:
            tag_name = next(iter(product_tags & preferred_tags))
            return f"Khớp với sở thích gần đây qua tag {tag_name}.", "user_tag"
        if product.shopId in shop_ids and shop:
            return f"Bạn từng quan tâm sản phẩm từ shop {shop}.", "user_shop"
        if average_price > 0:
            product_price = float(getattr(product, "price", 0) or 0)
            if product_price > 0 and abs(product_price - average_price) / max(average_price, 1) <= 0.35:
                return "Mức giá gần với thói quen mua sắm của bạn.", "user_price"

        return "Đang được nhiều người quan tâm và phù hợp để tham khảo thêm.", "popular"

    @classmethod
    def _shared_tags(cls, product, other_product) -> List[str]:
        product_tags = {
            cls._normalize(getattr(tag, "name", "")): getattr(tag, "name", "")
            for tag in getattr(product, "tags", []) or []
            if getattr(tag, "name", None)
        }
        other_tags = {
            cls._normalize(getattr(tag, "name", ""))
            for tag in getattr(other_product, "tags", []) or []
            if getattr(tag, "name", None)
        }
        return [product_tags[key] for key in product_tags.keys() & other_tags if product_tags[key]]

    @classmethod
    def _product_followup_suggestions(cls, products: List[ChatbotProductOut]) -> List[str]:
        if not products:
            return cls.PRODUCT_SUGGESTIONS

        first_category = products[0].categoryName
        suggestions = ["Sản phẩm tương tự", "So sánh các lựa chọn này"]
        if first_category:
            suggestions.append(f"Tìm thêm {first_category}")
        else:
            suggestions.append("Tìm sản phẩm giá tốt")
        return suggestions

    @classmethod
    def _product_recommendation_answer(cls, intent: str, context) -> str:
        products: List[ChatbotProductOut] = context.get("products") or []
        if not products:
            return "Mình chưa thấy món nào thật sát. Bạn nói thêm loại sản phẩm, ngân sách hoặc shop muốn xem nhé."

        lead = products[0]
        other_names = ", ".join(product.name for product in products[1:3])
        reason = cls._repair_mojibake(lead.reason or "món này khá phù hợp để bạn tham khảo.")
        lead_price = f"{lead.price:,.0f} VND"
        category = f" trong danh mục {lead.categoryName}" if lead.categoryName else ""
        shop = f" từ {lead.shopName}" if lead.shopName else ""
        if other_names:
            return (
                f"Mình nghiêng về {lead.name}{category}{shop} trước, giá khoảng {lead_price}. "
                f"{reason} Mình cũng để thêm {other_names} bên dưới để bạn so nhanh."
            )
        return (
            f"Mình nghiêng về {lead.name}{category}{shop}, giá khoảng {lead_price}. "
            f"{reason} Bạn mở thẻ sản phẩm bên dưới để xem phân loại, tồn kho và thông tin shop nhé."
        )

    @classmethod
    def _score_product_match(cls, product, terms: List[str]) -> float:
        if not terms:
            return 0.0

        fields: Dict[str, str] = {
            "name": product.name or "",
            "description": product.description or "",
            "category": getattr(getattr(product, "category", None), "name", "") or "",
            "shop": getattr(getattr(product, "shop", None), "name", "") or "",
            "tags": " ".join(getattr(tag, "name", "") for tag in getattr(product, "tags", []) or []),
        }
        normalized_fields = {key: cls._normalize(value) for key, value in fields.items()}
        score = 0.0

        for term in terms:
            if term in normalized_fields["name"]:
                score += 5.0
            if term in normalized_fields["category"]:
                score += 3.0
            if term in normalized_fields["tags"]:
                score += 2.5
            if term in normalized_fields["shop"]:
                score += 1.5
            if term in normalized_fields["description"]:
                score += 1.0

        return score

    @staticmethod
    def _score_budget_match(product, budget: Optional[float]) -> float:
        if not budget:
            return 0.0

        price = float(getattr(product, "price", 0) or 0)
        if price <= 0 or price > budget:
            return 0.0

        closeness = 1.0 - min((budget - price) / max(budget, 1), 1.0)
        return 2.0 + closeness * 2.0

    @classmethod
    def _extract_budget(cls, message: str) -> Optional[float]:
        normalized = cls._normalize(message).replace(",", ".")
        match = re.search(r"(?:duoi|toi da|tam|khoang|<=|<)\s*(\d+(?:\.\d+)?)\s*(k|nghin|ngan|tr|trieu|m|d|vnd)?", normalized)
        if not match:
            return None

        value = float(match.group(1))
        unit = match.group(2) or ""
        if unit in {"k", "nghin", "ngan"}:
            return value * 1_000
        if unit in {"tr", "trieu", "m"}:
            return value * 1_000_000
        if value < 1_000:
            return value * 1_000
        return value

    @classmethod
    def _detect_intent(cls, normalized: str) -> str:
        if cls._has_any(normalized, ["xin chao", "chao", "hello", "hi"]) and len(normalized.split()) <= 4:
            return "greeting"
        if cls._has_any(normalized, ["dat hang", "mua hang nhu the nao", "cach mua", "cach dat", "huong dan mua", "quy trinh dat"]):
            return "order_guide"
        if cls._has_any(normalized, ["gio hang", "cart"]):
            return "cart"
        if cls._has_any(normalized, ["huy don", "yeu cau huy", "cancel order", "khong muon mua", "huy hang"]):
            return "order_cancel"
        if cls._has_any(normalized, ["doi tra", "tra hang", "hoan tien", "return", "refund"]):
            return "return_policy"
        if cls._has_any(normalized, ["danh gia", "review", "nhan hang", "da nhan duoc hang", "hoan tat don"]):
            return "review"
        if cls._has_any(normalized, ["ma van don", "tracking", "theo doi van chuyen", "don vi van chuyen", "ban giao", "gui hang", "da gui hang"]):
            return "tracking"
        if cls._has_any(normalized, ["don hang", "order", "trang thai don"]):
            return "orders"
        if cls._has_any(normalized, ["thanh toan", "payment", "cod", "vnpay", "momo", "stripe"]):
            return "payment"
        if cls._has_any(normalized, ["van chuyen", "giao hang", "ship", "shipping"]):
            return "shipping"
        if cls._has_any(normalized, ["dang nhap", "dang ky", "tai khoan", "quen mat khau", "login", "register"]):
            return "auth"
        if cls._has_any(normalized, ["flash sale", "flashsale", "sale soc", "khung gio sale"]):
            return "flash_sale"
        if cls._has_any(normalized, ["khuyen mai", "ma giam", "voucher", "coupon", "uu dai", "sale"]):
            return "promotion"
        if cls._has_any(normalized, ["kenh nguoi ban", "nguoi ban", "seller", "ban hang", "mo shop"]):
            return "seller"
        if cls._has_any(normalized, ["yeu thich", "wishlist", "san pham da luu", "da luu"]):
            return "wishlist"
        if cls._has_any(normalized, ["het hang", "con hang", "ton kho", "phan loai", "variant", "size", "mau sac"]):
            return "stock"
        if cls._has_any(normalized, ["goi y", "de xuat", "phu hop", "recommend", "tu van"]):
            return "recommend"
        if cls._has_any(normalized, ["san pham", "gia", "shop", "danh muc", "mua", "tim", "con hang", "tuong tu"]):
            return "product_search"
        return "general"

    @classmethod
    def _fallback_answer(cls, intent: str, context, reason: str) -> str:
        if "no local model" in reason.lower():
            return "Mình đang chưa bật được mô hình trả lời tự động. Bạn thử lại sau ít phút, hoặc hỏi ngắn hơn để mình tra theo dữ liệu có sẵn nhé."

        context_lines = context.get("context_lines") or []
        products = context.get("products") or []
        if products:
            return cls._product_recommendation_answer(intent, context)

        if intent == "cart":
            cart_line = cls._first_context_line(context_lines, "Giỏ hàng")
            if cart_line:
                return f"{cls._repair_mojibake(cart_line)} Bạn vào giỏ hàng để kiểm tra số lượng, áp voucher rồi thanh toán nhé."
            return "Mình chỉ xem được giỏ hàng khi bạn đã đăng nhập. Bạn đăng nhập rồi hỏi lại, mình sẽ tóm tắt giỏ cho bạn."
        if intent == "order_guide":
            return "Bạn chọn sản phẩm, chọn phân loại/số lượng rồi bấm thêm vào giỏ hoặc mua ngay. Tới checkout thì kiểm tra địa chỉ, voucher, phí ship và phương thức thanh toán trước khi xác nhận."
        if intent == "orders":
            order_line = cls._first_context_line(context_lines, "Đơn ") or cls._first_context_line(context_lines, "Người dùng")
            if order_line:
                return f"{cls._repair_mojibake(order_line)} Bạn mở trang Đơn hàng để xem chi tiết, vận chuyển và timeline trạng thái nhé."
            return "Mình chỉ xem được đơn hàng khi bạn đã đăng nhập. Bạn đăng nhập rồi hỏi lại để mình kiểm tra đơn gần đây."
        if intent == "order_cancel":
            return "Bạn hủy đơn trong trang chi tiết đơn nếu trạng thái còn cho phép. Nếu đơn đã gửi/giao rồi thì không hủy trực tiếp nữa; lúc đó bạn theo dõi giao hàng hoặc tạo yêu cầu trả hàng nếu sản phẩm có vấn đề."
        if intent == "payment":
            return "MarketHub hỗ trợ COD, MoMo QR, VNPay QR và Stripe. Với MoMo/VNPay, hệ thống chỉ ghi nhận thanh toán khi cổng thanh toán báo thành công; COD thì seller xử lý đơn và bạn trả tiền khi nhận hàng."
        if intent == "shipping":
            return "Phí vận chuyển được tính ở checkout theo địa chỉ, sản phẩm và cấu hình của shop. Sau khi seller gửi hàng, bạn xem mã vận đơn và trạng thái giao trong chi tiết đơn."
        if intent == "tracking":
            return "Mã vận đơn sẽ hiện trong chi tiết đơn sau khi seller nhập thông tin vận chuyển. Khi đơn đã gửi hàng, thông tin bàn giao bị khóa để tránh sửa sai lịch sử giao hàng."
        if intent == "auth":
            return "Bạn đăng ký bằng email, mật khẩu, họ tên và số điện thoại. Sau khi đăng nhập, bạn có thể đặt hàng, theo dõi đơn, lưu yêu thích hoặc gửi hồ sơ mở Kênh người bán."
        if intent == "promotion":
            return "Voucher được nhập ở checkout và hệ thống sẽ kiểm tra điều kiện trước khi trừ tiền. Nếu mã không dùng được, thường là chưa đủ giá trị đơn, sai shop/danh mục hoặc voucher đã hết hạn."
        if intent == "flash_sale":
            return "Flash sale chỉ mua được khi còn trong khung giờ, còn quota và biến thể còn tồn kho. Nếu hết hạn hoặc hết suất, checkout phải quay về giá thường hoặc báo không mua được."
        if intent == "return_policy":
            return "Nếu cần trả hàng, bạn vào chi tiết đơn, chọn sản phẩm cần trả, nhập lý do và gửi ảnh/video bằng chứng. Sau khi duyệt, hệ thống mới xử lý bước hoàn tiền."
        if intent == "review":
            return "Bạn chỉ nên đánh giá sau khi đơn đã giao/hoàn tất. Khi đã xác nhận nhận hàng, nút đánh giá sản phẩm sẽ mở ở chi tiết đơn hoặc lịch sử mua hàng."
        if intent == "wishlist":
            return "Bạn bấm biểu tượng tim để lưu sản phẩm yêu thích. Khi đăng nhập, danh sách này được đồng bộ và cũng giúp hệ thống gợi ý sản phẩm sát hơn."
        if intent == "stock":
            return "Tồn kho được tính theo từng phân loại như size/màu. Phân loại hết hàng sẽ không cho chọn để thêm vào giỏ, và checkout vẫn kiểm tra lại lần cuối để tránh mua quá tồn."
        if intent == "seller":
            return "Muốn bán hàng thì bạn vào Kênh người bán, điền thông tin shop rồi gửi hồ sơ để admin duyệt. Khi được duyệt, bạn sẽ quản lý sản phẩm, đơn hàng, vận chuyển và doanh thu trong Seller Center."
        if intent == "greeting":
            return "Chào bạn, mình đây. Bạn muốn tìm sản phẩm, hỏi đơn hàng hay xem chính sách đổi trả?"
        return "Mình chưa thấy đủ dữ liệu để trả lời chắc. Bạn nói rõ hơn sản phẩm, ngân sách hoặc mã đơn cần kiểm tra nhé."

    @staticmethod
    def _first_context_line(context_lines: List[str], prefix: str) -> Optional[str]:
        return next((line for line in context_lines if line.startswith(prefix)), None)

    @staticmethod
    def _primary_image(product) -> Optional[str]:
        images = getattr(product, "images", []) or []
        primary = next((image for image in images if getattr(image, "isPrimary", False)), None)
        image = primary or (images[0] if images else None)
        return getattr(image, "url", None) if image else None

    @staticmethod
    def _is_active_product(product) -> bool:
        if not product or getattr(product, "deletedAt", None) is not None:
            return False
        status = getattr(product, "status", None)
        status_value = status.value if hasattr(status, "value") else str(status)
        return status_value == "ACTIVE"

    @classmethod
    def _extract_terms(cls, message: str) -> List[str]:
        normalized = cls._normalize(message)
        terms = [word for word in re.findall(r"[a-z0-9]+", normalized) if len(word) > 1 and word not in cls.STOP_WORDS]
        return terms[:8]

    @classmethod
    def _is_out_of_scope(cls, normalized: str) -> bool:
        blocked_terms = [
            "thoi tiet",
            "chinh tri",
            "bong da",
            "viet code",
            "lap trinh",
            "dich bai",
            "lam van",
            "tin tuc",
            "lich su",
            "toan hoc",
        ]
        app_terms = [
            "san pham",
            "mua",
            "gia",
            "shop",
            "gio hang",
            "don hang",
            "thanh toan",
            "van chuyen",
            "seller",
            "nguoi ban",
            "goi y",
            "de xuat",
            "market",
            "markethub",
        ]
        return cls._has_any(normalized, blocked_terms) and not cls._has_any(normalized, app_terms)

    @staticmethod
    def _has_any(text: str, needles: List[str]) -> bool:
        return any(needle in text for needle in needles)

    @staticmethod
    def _normalize(value: str) -> str:
        value = value.lower().replace("đ", "d")
        decomposed = unicodedata.normalize("NFD", value)
        return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")

    @staticmethod
    def _repair_mojibake(value: str) -> str:
        if not isinstance(value, str):
            return value
        markers = ("Ã", "Ä", "Â", "Æ", "Å", "â", "ð", "»", "º", "€", "œ", "�")
        if not any(marker in value for marker in markers):
            return value
        try:
            return value.encode("latin1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return value

    @staticmethod
    def _to_value(value) -> str:
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _clean_model_answer(answer: str) -> str:
        answer = ChatService._repair_mojibake(answer)
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL | re.IGNORECASE)
        answer = re.sub(r"^(final answer|tra loi|trả lời|cau tra loi|câu trả lời)\s*:\s*", "", answer, flags=re.IGNORECASE)
        answer = re.sub(r"[ \t]+", " ", answer)
        answer = re.sub(r" *\n *", "\n", answer)
        answer = re.sub(r"\n{3,}", "\n\n", answer).strip()
        return answer[: ChatService.ANSWER_MAX_LENGTH] if answer else "Hiện hệ thống chưa có dữ liệu phù hợp để trả lời câu này."

    @staticmethod
    def _naturalize_answer(answer: str) -> str:
        answer = ChatService._repair_mojibake(answer).strip()
        answer = re.sub(r"\n?\s*(Nguồn|Nguon|Source):\s*.*$", "", answer, flags=re.IGNORECASE)
        answer = re.sub(
            r"(?i)^(dựa trên|theo)\s+(context|ngữ cảnh|dữ liệu hệ thống|dữ liệu hiện có)[,:]?\s*",
            "",
            answer,
        )
        answer = re.sub(r"[ \t]+", " ", answer)
        answer = re.sub(r" *\n *", "\n", answer)
        answer = re.sub(r"\n{3,}", "\n\n", answer)
        return answer.strip() or "Mình chưa thấy đủ dữ liệu để trả lời chắc. Bạn nói rõ hơn giúp mình nhé."

    @staticmethod
    def _looks_like_reasoning(answer: str) -> bool:
        lowered = answer.lower().strip()
        reasoning_starts = (
            "okay,",
            "ok,",
            "let's",
            "i need",
            "the user",
            "hmm",
            "wait,",
            "first,",
        )
        return lowered.startswith(reasoning_starts) or "the user is asking" in lowered

    @classmethod
    def _response(
        cls,
        answer: str,
        intent: str,
        suggestions: Optional[List[str]] = None,
        products: Optional[List[ChatbotProductOut]] = None,
        sources: Optional[List[Dict]] = None,
    ):
        source_items = sources or []
        answer = cls._naturalize_answer(answer)
        return {
            "answer": answer[: cls.ANSWER_MAX_LENGTH],
            "intent": intent,
            "suggestions": suggestions or cls.SCOPE_SUGGESTIONS,
            "products": products or [],
            "sources": source_items,
        }
