import re
import unicodedata
from typing import Dict, List, Optional

from src.ai.recommendation_engine import RecommendationEngine
from src.core.database import prisma
from src.modules.chatbot.chatbot_schema import ChatbotProductOut
from src.modules.chatbot.ollama_client import OllamaClient, OllamaUnavailable


class ChatService:
    PRODUCT_INCLUDE = {
        "shop": True,
        "category": True,
        "images": True,
        "variants": True,
        "tags": True,
    }
    SCOPE_SUGGESTIONS = [
        "Goi y san pham cho toi",
        "Tim san pham gia tot",
        "Kiem tra gio hang",
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
    async def answer(cls, message: str, user_id: Optional[int] = None, product_id: Optional[int] = None):
        clean_message = message.strip()
        normalized = cls._normalize(clean_message)

        if not normalized:
            return cls._response("Ban can hoi ve san pham, don hang hoac gio hang nao?", "empty")

        if cls._is_out_of_scope(normalized):
            return cls._response(
                "Minh chi ho tro cau hoi ve san pham, gio hang, don hang, thanh toan, van chuyen va kenh nguoi ban trong MarketHub.",
                "out_of_scope",
            )

        intent = cls._detect_intent(normalized)
        context = await cls._build_context(intent, clean_message, user_id, product_id)

        if intent in {"cart", "orders", "payment", "shipping", "seller"}:
            return cls._response(
                cls._fallback_answer(intent, context, ""),
                intent,
                context.get("suggestions") or cls.SCOPE_SUGGESTIONS,
                context.get("products") or [],
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
        )

    @classmethod
    async def chat(cls, message: str):
        result = await cls.answer(message)
        return result["answer"]

    @classmethod
    async def _ask_ollama(cls, question: str, context_lines: List[str]) -> str:
        context_text = "\n".join(f"- {line}" for line in context_lines[:20])
        if not context_text:
            context_text = "- Khong co du lieu phu hop trong he thong."

        messages = [
            {
                "role": "system",
                "content": (
                    "Ban la chatbot cho do an thuong mai dien tu MarketHub. "
                    "Chi tra loi trong pham vi ung dung: san pham, goi y, gio hang, don hang, thanh toan, van chuyen, kenh nguoi ban. "
                    "Chi dung du lieu trong CONTEXT, khong tu bia thong tin. "
                    "Neu CONTEXT khong du, noi ngan gon rang he thong chua co du lieu. "
                    "Tra loi bang tieng Viet tu nhien, toi da 3 cau, khong lan man."
                ),
            },
            {
                "role": "user",
                "content": f"CONTEXT:\n{context_text}\n\nCAU HOI:\n{question}",
            },
        ]

        raw_answer = await OllamaClient.chat(messages)
        return cls._clean_model_answer(raw_answer)

    @classmethod
    async def _build_context(cls, intent: str, message: str, user_id: Optional[int], product_id: Optional[int]):
        context_lines = [
            "MarketHub la website ecommerce trong do an.",
            "Cac chuc nang chinh: xem san pham, tim kiem san pham, gio hang, checkout, don hang, seller center.",
        ]
        products: List[ChatbotProductOut] = []
        suggestions = cls.SCOPE_SUGGESTIONS

        if intent in {"recommend", "product_search", "general"}:
            matched_products = await cls._find_products_for_message(message, user_id, product_id, prefer_recommend=intent == "recommend")
            products = cls._serialize_products(matched_products)
            if products:
                context_lines.append("San pham lien quan trong he thong:")
                context_lines.extend(cls._product_context_lines(matched_products))
                suggestions = ["Goi y san pham tuong tu", "Kiem tra gio hang", "Hoi ve van chuyen"]

        if product_id:
            current_product = await cls._get_current_product(product_id)
            if current_product:
                context_lines.append("San pham nguoi dung dang xem:")
                context_lines.extend(cls._product_context_lines([current_product]))

        if intent == "cart":
            context_lines.extend(await cls._cart_context_lines(user_id))
            suggestions = ["Xem don hang cua toi", "Goi y san pham", "Hoi ve thanh toan"]

        if intent == "orders":
            context_lines.extend(await cls._order_context_lines(user_id))
            suggestions = ["Kiem tra gio hang", "Hoi ve van chuyen", "Goi y san pham"]

        if intent == "payment":
            context_lines.append("MarketHub ho tro COD, MoMo QR, VNPay QR va Stripe tai buoc checkout.")
            suggestions = ["Hoi ve van chuyen", "Kiem tra gio hang", "Xem don hang"]

        if intent == "shipping":
            context_lines.append("Phi van chuyen duoc tinh tai checkout theo dia chi va don hang.")
            context_lines.append("Thanh top bar hien thong diep mien phi van chuyen cho don hang tren 500k.")
            suggestions = ["Hoi ve thanh toan", "Kiem tra gio hang", "Goi y san pham"]

        if intent == "seller":
            context_lines.append("Nguoi dung co the mo Kenh nguoi ban, gui thong tin shop va cho admin duyet.")
            context_lines.append("Seller Center co quan ly san pham, don hang, dashboard va thong ke.")
            suggestions = ["Mo Kenh nguoi ban", "Quan ly san pham", "Kiem tra don hang"]

        return {
            "context_lines": context_lines,
            "products": products,
            "suggestions": suggestions,
        }

    @classmethod
    async def _find_products_for_message(
        cls,
        message: str,
        user_id: Optional[int],
        product_id: Optional[int],
        prefer_recommend: bool,
    ):
        if prefer_recommend:
            product_ids, _algorithm = await RecommendationEngine.recommend_product_ids(
                user_id=user_id,
                top_k=4,
                context_product_id=product_id,
            )
            return await cls._products_by_rank(product_ids)

        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include=cls.PRODUCT_INCLUDE,
            take=140,
        )
        terms = cls._extract_terms(message)
        scored_products = []

        for product in products:
            score = cls._score_product_match(product, terms)
            if score > 0:
                scored_products.append((score, product))

        scored_products.sort(key=lambda pair: pair[0], reverse=True)
        if scored_products:
            return [product for _, product in scored_products[:4]]

        product_ids, _algorithm = await RecommendationEngine.recommend_product_ids(
            user_id=user_id,
            top_k=4,
            context_product_id=product_id,
        )
        return await cls._products_by_rank(product_ids)

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

    @classmethod
    async def _cart_context_lines(cls, user_id: Optional[int]) -> List[str]:
        if user_id is None:
            return ["Nguoi dung chua dang nhap nen khong the xem gio hang ca nhan."]

        cart = await prisma.cart.find_unique(where={"userId": user_id}, include={"items": True})
        items = getattr(cart, "items", []) if cart else []
        total_quantity = sum(max(item.quantity or 0, 0) for item in items)
        if total_quantity == 0:
            return ["Gio hang cua nguoi dung dang trong."]
        return [f"Gio hang hien co {total_quantity} san pham."]

    @classmethod
    async def _order_context_lines(cls, user_id: Optional[int]) -> List[str]:
        if user_id is None:
            return ["Nguoi dung chua dang nhap nen khong the xem don hang ca nhan."]

        orders = await prisma.order.find_many(
            where={"userId": user_id, "deletedAt": None},
            order={"createdAt": "desc"},
            take=3,
        )
        if not orders:
            return ["Nguoi dung chua co don hang gan day."]

        lines = ["Don hang gan day:"]
        for order in orders:
            lines.append(f"Don #{order.id}: trang thai {cls._to_value(order.status)}, tong tien {float(order.totalAmount or 0):,.0f} VND.")
        return lines

    @classmethod
    def _serialize_products(cls, products) -> List[ChatbotProductOut]:
        return [
            ChatbotProductOut(
                id=product.id,
                name=product.name,
                price=float(product.price or 0),
                imageUrl=cls._primary_image(product),
                shopName=getattr(getattr(product, "shop", None), "name", None),
                categoryName=getattr(getattr(product, "category", None), "name", None),
            )
            for product in products
            if getattr(product, "status", None) == "ACTIVE" and getattr(product, "deletedAt", None) is None
        ]

    @classmethod
    def _product_context_lines(cls, products) -> List[str]:
        lines = []
        for product in products[:5]:
            stock = sum(max(getattr(variant, "stock", 0) or 0, 0) for variant in getattr(product, "variants", []) or [])
            category = getattr(getattr(product, "category", None), "name", None) or "Chua co danh muc"
            shop = getattr(getattr(product, "shop", None), "name", None) or "Chua co shop"
            lines.append(
                f"#{product.id} {product.name}; gia {float(product.price or 0):,.0f} VND; danh muc {category}; shop {shop}; ton kho {stock}."
            )
        return lines

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

    @classmethod
    def _detect_intent(cls, normalized: str) -> str:
        if cls._has_any(normalized, ["gio hang", "cart"]):
            return "cart"
        if cls._has_any(normalized, ["don hang", "order", "trang thai don"]):
            return "orders"
        if cls._has_any(normalized, ["thanh toan", "payment", "cod", "vnpay", "momo", "stripe"]):
            return "payment"
        if cls._has_any(normalized, ["van chuyen", "giao hang", "ship", "shipping"]):
            return "shipping"
        if cls._has_any(normalized, ["kenh nguoi ban", "nguoi ban", "seller", "ban hang", "mo shop"]):
            return "seller"
        if cls._has_any(normalized, ["goi y", "de xuat", "phu hop", "recommend", "tu van"]):
            return "recommend"
        if cls._has_any(normalized, ["san pham", "gia", "shop", "danh muc", "mua", "tim"]):
            return "product_search"
        return "general"

    @classmethod
    def _fallback_answer(cls, intent: str, context, reason: str) -> str:
        if "no local model" in reason.lower():
            return "Ollama dang chay nhung chua co model kha dung. Hay pull model nhu qwen3:4b roi thu lai."

        context_lines = context.get("context_lines") or []
        products = context.get("products") or []
        if products:
            names = ", ".join(product.name for product in products[:3])
            return f"Minh tim thay {names}. Ban co the mo san pham ben duoi de xem chi tiet."

        if intent == "cart":
            return cls._first_context_line(context_lines, "Gio hang") or "Minh chi kiem tra duoc gio hang khi ban da dang nhap."
        if intent == "orders":
            return cls._first_context_line(context_lines, "Don ") or cls._first_context_line(context_lines, "Nguoi dung") or "Minh chi xem duoc don hang khi ban da dang nhap."
        if intent == "payment":
            return "MarketHub ho tro COD, MoMo QR, VNPay QR va Stripe tai buoc checkout."
        if intent == "shipping":
            return "Phi van chuyen duoc tinh tai checkout theo dia chi va don hang."
        if intent == "seller":
            return "De ban hang, vao Kenh nguoi ban, gui thong tin shop va cho admin duyet."
        return "Hien he thong chua co du lieu phu hop de tra loi cau nay."

    @staticmethod
    def _first_context_line(context_lines: List[str], prefix: str) -> Optional[str]:
        return next((line for line in context_lines if line.startswith(prefix)), None)

    @staticmethod
    def _primary_image(product) -> Optional[str]:
        images = getattr(product, "images", []) or []
        primary = next((image for image in images if getattr(image, "isPrimary", False)), None)
        image = primary or (images[0] if images else None)
        return getattr(image, "url", None) if image else None

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
        value = value.lower().replace("\u0111", "d")
        decomposed = unicodedata.normalize("NFD", value)
        return "".join(char for char in decomposed if unicodedata.category(char) != "Mn")

    @staticmethod
    def _to_value(value) -> str:
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _clean_model_answer(answer: str) -> str:
        answer = re.sub(r"<think>.*?</think>", "", answer, flags=re.DOTALL | re.IGNORECASE)
        answer = re.sub(r"^(final answer|tra loi|cau tra loi)\s*:\s*", "", answer, flags=re.IGNORECASE)
        answer = re.sub(r"\s+", " ", answer).strip()
        return answer[:650] if answer else "Hien he thong chua co du lieu phu hop de tra loi cau nay."

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
    ):
        return {
            "answer": answer[:650],
            "intent": intent,
            "suggestions": suggestions or cls.SCOPE_SUGGESTIONS,
            "products": products or [],
        }
