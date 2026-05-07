import re
import unicodedata
from typing import Dict, List, Optional

from src.ai.recommendation_engine import RecommendationEngine
from src.core.database import prisma
from src.modules.chatbot.chatbot_schema import ChatbotProductOut


class ChatbotService:
    PRODUCT_INCLUDE = {
        "shop": True,
        "category": True,
        "images": True,
        "variants": True,
        "tags": True,
    }
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
    SCOPE_SUGGESTIONS = [
        "Goi y san pham cho toi",
        "Tim san pham gia tot",
        "Kiem tra gio hang",
    ]

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

        if cls._has_any(normalized, ["gio hang", "cart"]):
            return await cls._answer_cart(user_id)

        if cls._has_any(normalized, ["don hang", "order", "trang thai don"]):
            return await cls._answer_orders(user_id)

        if cls._has_any(normalized, ["thanh toan", "payment", "cod", "vnpay", "stripe"]):
            return cls._response("MarketHub ho tro COD, VNPAY va Stripe. Ban chon phuong thuc thanh toan tai buoc checkout.", "payment")

        if cls._has_any(normalized, ["van chuyen", "giao hang", "ship", "shipping"]):
            return cls._response(
                "Phi van chuyen duoc tinh tai checkout theo dia chi va don hang. Don tu 500k co the duoc mien phi van chuyen neu chuong trinh dang ap dung.",
                "shipping",
            )

        if cls._has_any(normalized, ["kenh nguoi ban", "nguoi ban", "seller", "ban hang", "mo shop"]):
            return cls._response(
                "De ban hang, vao Kenh nguoi ban, gui thong tin shop va cho admin duyet. Khi duoc duyet, ban co the tao san pham va quan ly don trong Seller Center.",
                "seller",
                ["Mo Kenh nguoi ban", "Xem san pham cua shop", "Kiem tra don hang"],
            )

        if cls._has_any(normalized, ["goi y", "de xuat", "phu hop", "recommend", "tu van"]):
            return await cls._answer_recommendations(user_id, product_id)

        return await cls._answer_product_search(clean_message)

    @classmethod
    async def _answer_cart(cls, user_id: Optional[int]):
        if user_id is None:
            return cls._response("Ban can dang nhap de minh kiem tra gio hang.", "cart_auth", ["Dang nhap", "Tim san pham"])

        cart = await prisma.cart.find_unique(where={"userId": user_id}, include={"items": True})
        items = getattr(cart, "items", []) if cart else []
        total_quantity = sum(max(item.quantity or 0, 0) for item in items)

        if total_quantity == 0:
            return cls._response("Gio hang cua ban dang trong. Minh co the goi y san pham phu hop neu ban muon.", "cart")

        return cls._response(f"Gio hang hien co {total_quantity} san pham. Ban co the vao Gio hang de kiem tra so luong va thanh toan.", "cart")

    @classmethod
    async def _answer_orders(cls, user_id: Optional[int]):
        if user_id is None:
            return cls._response("Ban can dang nhap de xem don hang cua minh.", "order_auth", ["Dang nhap", "Xem gio hang"])

        orders = await prisma.order.find_many(
            where={"userId": user_id, "deletedAt": None},
            order={"createdAt": "desc"},
            take=3,
        )
        if not orders:
            return cls._response("Ban chua co don hang nao gan day.", "orders")

        latest = orders[0]
        status = cls._to_value(latest.status)
        return cls._response(f"Don hang gan nhat cua ban la #{latest.id}, trang thai {status}. Vao muc Don hang de xem chi tiet.", "orders")

    @classmethod
    async def _answer_recommendations(cls, user_id: Optional[int], product_id: Optional[int]):
        product_ids, _algorithm = await RecommendationEngine.recommend_product_ids(
            user_id=user_id,
            top_k=4,
            context_product_id=product_id,
        )
        products = await cls._products_by_rank(product_ids)
        if not products:
            return cls._response("Hien chua co du lieu de goi y chinh xac. Ban co the xem cac san pham moi nhat tren trang san pham.", "recommend")

        names = ", ".join(product.name for product in products[:3])
        return cls._response(
            f"Minh goi y {names}. Cac san pham nay dua tren hanh vi mua sam va san pham ban dang quan tam.",
            "recommend",
            ["Tim san pham tuong tu", "Xem gio hang"],
            cls._serialize_products(products),
        )

    @classmethod
    async def _answer_product_search(cls, message: str):
        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include=cls.PRODUCT_INCLUDE,
            take=120,
        )
        terms = cls._extract_terms(message)
        scored_products = []

        for product in products:
            score = cls._score_product_match(product, terms)
            if score > 0:
                scored_products.append((score, product))

        scored_products.sort(key=lambda pair: pair[0], reverse=True)
        matched_products = [product for _, product in scored_products[:4]]

        if not matched_products:
            return cls._response(
                "Minh chua tim thay san pham phu hop. Ban thu nhap ten san pham, danh muc hoac khoang gia cu the hon.",
                "product_search",
                ["Goi y san pham cho toi", "San pham gia tot"],
            )

        names = ", ".join(product.name for product in matched_products[:3])
        return cls._response(
            f"Minh tim thay {names}. Ban co the mo san pham ben duoi de xem gia, ton kho va shop ban.",
            "product_search",
            ["Goi y san pham tuong tu", "Kiem tra gio hang"],
            cls._serialize_products(matched_products),
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
        ]

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

        stock = sum(max(getattr(variant, "stock", 0) or 0, 0) for variant in getattr(product, "variants", []) or [])
        if stock > 0:
            score += 0.5

        return score

    @classmethod
    def _extract_terms(cls, message: str) -> List[str]:
        normalized = cls._normalize(message)
        terms = [word for word in re.findall(r"[a-z0-9]+", normalized) if len(word) > 1 and word not in cls.STOP_WORDS]
        return terms[:8]

    @staticmethod
    def _primary_image(product) -> Optional[str]:
        images = getattr(product, "images", []) or []
        primary = next((image for image in images if getattr(image, "isPrimary", False)), None)
        image = primary or (images[0] if images else None)
        return getattr(image, "url", None) if image else None

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
    def _to_value(value) -> str:
        return value.value if hasattr(value, "value") else str(value)

    @classmethod
    def _response(cls, answer: str, intent: str, suggestions: Optional[List[str]] = None, products: Optional[List[ChatbotProductOut]] = None):
        return {
            "answer": answer[:520],
            "intent": intent,
            "suggestions": suggestions or cls.SCOPE_SUGGESTIONS,
            "products": products or [],
        }
