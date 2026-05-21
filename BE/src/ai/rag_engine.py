from dataclasses import dataclass
import hashlib
import math
import re
import time
from typing import Dict, List, Optional, Sequence, Tuple

from src.ai.semantic_retrieval import normalize_text
from src.core.database import prisma


@dataclass(frozen=True)
class RagChunk:
    source_id: str
    title: str
    kind: str
    content: str
    metadata: Dict
    embedding: List[float]


@dataclass(frozen=True)
class RagSource:
    source_id: str
    title: str
    kind: str
    content: str
    score: float
    metadata: Dict


class HashingEmbeddingModel:
    DIMENSIONS = 384
    TOKEN_WEIGHT = 1.0
    BIGRAM_WEIGHT = 1.25
    CHARGRAM_WEIGHT = 0.35

    @classmethod
    def embed(cls, text: str) -> List[float]:
        vector = [0.0] * cls.DIMENSIONS
        normalized = normalize_text(text)
        tokens = cls._tokens(normalized)

        for token in tokens:
            cls._add_feature(vector, token, cls.TOKEN_WEIGHT)

        for left, right in zip(tokens, tokens[1:]):
            cls._add_feature(vector, f"{left}_{right}", cls.BIGRAM_WEIGHT)

        compact = "".join(tokens)
        for index in range(max(0, len(compact) - 2)):
            cls._add_feature(vector, compact[index : index + 3], cls.CHARGRAM_WEIGHT)

        return cls._normalize_vector(vector)

    @staticmethod
    def _tokens(text: str) -> List[str]:
        return [token for token in re.findall(r"[a-z0-9]+", text) if len(token) > 1]

    @classmethod
    def _add_feature(cls, vector: List[float], feature: str, weight: float) -> None:
        digest = hashlib.blake2b(feature.encode("utf-8"), digest_size=8).digest()
        index = int.from_bytes(digest[:4], "big") % cls.DIMENSIONS
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign * weight

    @staticmethod
    def _normalize_vector(vector: List[float]) -> List[float]:
        norm = math.sqrt(sum(value * value for value in vector))
        if norm <= 0:
            return vector
        return [value / norm for value in vector]


class RagEngine:
    CACHE_TTL_SECONDS = 90
    MAX_CONTEXT_CHARS = 620

    _chunk_cache: Optional[Tuple[float, List[RagChunk]]] = None

    STATIC_DOCUMENTS = [
        (
            "K1",
            "Tổng quan MarketHub",
            "knowledge",
            "MarketHub là website thương mại điện tử trong đồ án. Người dùng có thể xem sản phẩm, tìm kiếm, thêm giỏ hàng, checkout, theo dõi đơn hàng, yêu thích sản phẩm, đánh giá sản phẩm và mở Kênh người bán.",
        ),
        (
            "K2",
            "Hướng dẫn đặt hàng",
            "policy",
            "Quy trình đặt hàng gồm mở sản phẩm, chọn phân loại và số lượng, thêm vào giỏ hoặc mua ngay, chọn địa chỉ nhận hàng, áp voucher nếu có, chọn phương thức thanh toán rồi xác nhận. Sau khi đặt, đơn đi qua các trạng thái như chờ xác nhận, đã xác nhận, đang xử lý, chờ lấy hàng, đang vận chuyển, đã giao và hoàn tất.",
        ),
        (
            "K3",
            "Thanh toán",
            "policy",
            "MarketHub hỗ trợ COD, MoMo QR, VNPay QR và Stripe tại checkout. Với MoMo hoặc VNPay, đơn chỉ được ghi nhận đã thanh toán khi cổng thanh toán trả kết quả thành công về hệ thống. Nếu thanh toán lỗi hoặc hết hạn, người dùng có thể quay lại đơn hàng để thử lại hoặc chọn phương thức khác.",
        ),
        (
            "K4",
            "Vận chuyển",
            "policy",
            "Phí vận chuyển được tính ở checkout dựa trên địa chỉ nhận hàng, sản phẩm trong đơn và cấu hình vận chuyển của shop. Giao diện có thông điệp miễn phí vận chuyển cho đơn hàng trên 500.000đ, nhưng điều kiện cụ thể vẫn cần kiểm tra tại bước thanh toán.",
        ),
        (
            "K5",
            "Đổi trả và hoàn tiền",
            "policy",
            "Người dùng có thể gửi yêu cầu trả hàng từ chi tiết đơn, chọn sản phẩm cần trả, nhập lý do và gửi bằng chứng như ảnh hoặc video. Admin hoặc seller xem xét yêu cầu; nếu được duyệt, quy trình hoàn tiền được xử lý theo trạng thái trả hàng và dữ liệu thanh toán của đơn.",
        ),
        (
            "K6",
            "Tài khoản",
            "policy",
            "Người dùng cần đăng ký bằng email, mật khẩu, họ tên và số điện thoại. Sau khi đăng nhập, người dùng có thể đặt hàng, lưu wishlist, xem giỏ hàng và theo dõi đơn. Nếu tài khoản bị khóa hoặc đăng nhập lỗi, người dùng cần kiểm tra thông tin hoặc liên hệ hỗ trợ.",
        ),
        (
            "K7",
            "Kênh người bán",
            "seller",
            "Người dùng có thể mở Kênh người bán bằng cách gửi thông tin shop và chờ admin duyệt. Sau khi được duyệt, seller có thể quản lý sản phẩm, đơn hàng, vận chuyển, tồn kho, marketing, đánh giá và tài chính trong Seller Center.",
        ),
        (
            "K8",
            "Khuyến mãi và voucher",
            "policy",
            "MarketHub có voucher, banner marketing, flash sale và ưu đãi vận chuyển nếu đơn đủ điều kiện. Người dùng nhập mã voucher ở checkout; hệ thống kiểm tra thời hạn, giá trị đơn tối thiểu, phạm vi áp dụng và lượt sử dụng trước khi trừ tiền.",
        ),
        (
            "K9",
            "Hỗ trợ khách hàng",
            "support",
            "Người dùng có thể liên hệ hỗ trợ khi gặp vấn đề về sản phẩm, đơn hàng, thanh toán, vận chuyển, tài khoản hoặc đổi trả. Khi liên hệ, nên cung cấp mã đơn hàng, email tài khoản và bằng chứng liên quan để xử lý nhanh hơn.",
        ),
    ]

    @classmethod
    async def retrieve(
        cls,
        query: str,
        user_id: Optional[int] = None,
        product_id: Optional[int] = None,
        top_k: int = 8,
    ) -> List[RagSource]:
        chunks = await cls._get_chunks()
        user_chunks = await cls._build_user_chunks(user_id)
        if user_chunks:
            chunks = user_chunks + chunks

        query_embedding = HashingEmbeddingModel.embed(query)
        query_terms = set(HashingEmbeddingModel._tokens(normalize_text(query)))
        scored_sources: List[RagSource] = []

        for chunk in chunks:
            score = cosine_similarity(query_embedding, chunk.embedding)
            score += cls._keyword_overlap_score(query_terms, chunk.content)
            if product_id and chunk.metadata.get("productId") == product_id:
                score += 0.25
            if score <= 0.03:
                continue
            scored_sources.append(
                RagSource(
                    source_id=chunk.source_id,
                    title=chunk.title,
                    kind=chunk.kind,
                    content=chunk.content[: cls.MAX_CONTEXT_CHARS],
                    score=score,
                    metadata=chunk.metadata,
                )
            )

        scored_sources.sort(key=lambda source: source.score, reverse=True)
        return cls._dedupe_sources(scored_sources)[:top_k]

    @classmethod
    async def _get_chunks(cls) -> List[RagChunk]:
        now = time.monotonic()
        if cls._chunk_cache and now - cls._chunk_cache[0] < cls.CACHE_TTL_SECONDS:
            return cls._chunk_cache[1]

        chunks = cls._static_chunks()
        chunks.extend(await cls._product_chunks())
        cls._chunk_cache = (now, chunks)
        return chunks

    @classmethod
    def _static_chunks(cls) -> List[RagChunk]:
        return [
            cls._make_chunk(
                source_id=source_id,
                title=title,
                kind=kind,
                content=content,
                metadata={"source": "static_knowledge"},
            )
            for source_id, title, kind, content in cls.STATIC_DOCUMENTS
        ]

    @classmethod
    async def _product_chunks(cls) -> List[RagChunk]:
        products = await prisma.product.find_many(
            where={"status": "ACTIVE", "deletedAt": None},
            include={
                "category": True,
                "shop": True,
                "tags": True,
                "attributes": True,
                "variants": True,
                "reviews": True,
            },
            take=300,
        )

        chunks = []
        for product in products:
            stock = sum(max(getattr(variant, "stock", 0) or 0, 0) for variant in getattr(product, "variants", []) or [])
            tags = ", ".join(getattr(tag, "name", "") for tag in getattr(product, "tags", []) or [] if getattr(tag, "name", None))
            attributes = "; ".join(
                f"{getattr(attribute, 'key', '')}: {getattr(attribute, 'value', '')}"
                for attribute in getattr(product, "attributes", []) or []
            )
            reviews = getattr(product, "reviews", []) or []
            rating_text = ""
            if reviews:
                rating = sum(float(getattr(review, "rating", 0) or 0) for review in reviews) / len(reviews)
                rating_text = f"Đánh giá trung bình {rating:.1f}/5 từ {len(reviews)} lượt đánh giá."

            content = " ".join(
                part
                for part in [
                    f"Sản phẩm #{product.id}: {product.name}.",
                    f"Giá {float(product.price or 0):,.0f} VND.",
                    f"Danh mục {getattr(getattr(product, 'category', None), 'name', 'Chưa có danh mục')}.",
                    f"Shop {getattr(getattr(product, 'shop', None), 'name', 'Chưa có shop')}.",
                    f"Tồn kho {stock}.",
                    f"Tags: {tags}." if tags else "",
                    f"Thuộc tính: {attributes}." if attributes else "",
                    f"Mô tả: {getattr(product, 'description', '') or 'Chưa có mô tả'}",
                    rating_text,
                ]
                if part
            )
            chunks.append(
                cls._make_chunk(
                    source_id=f"P{product.id}",
                    title=f"#{product.id} {product.name}",
                    kind="product",
                    content=content,
                    metadata={"source": "product", "productId": product.id, "route": f"/product/{product.id}"},
                )
            )
        return chunks

    @classmethod
    async def _build_user_chunks(cls, user_id: Optional[int]) -> List[RagChunk]:
        if user_id is None:
            return []

        chunks: List[RagChunk] = []
        cart = await prisma.cart.find_unique(where={"userId": user_id}, include={"items": True})
        cart_items = getattr(cart, "items", []) if cart else []
        cart_quantity = sum(max(getattr(item, "quantity", 0) or 0, 0) for item in cart_items)
        chunks.append(
            cls._make_chunk(
                source_id="U1",
                title="Giỏ hàng hiện tại",
                kind="user_context",
                content=f"Giỏ hàng của người dùng hiện có {cart_quantity} sản phẩm." if cart_quantity else "Giỏ hàng của người dùng đang trống.",
                metadata={"source": "user_cart"},
            )
        )

        orders = await prisma.order.find_many(
            where={"userId": user_id, "deletedAt": None},
            order={"createdAt": "desc"},
            take=3,
        )
        if orders:
            order_lines = [
                f"Đơn #{order.id}: trạng thái {getattr(order.status, 'value', str(order.status))}, tổng tiền {float(order.totalAmount or 0):,.0f} VND."
                for order in orders
            ]
            chunks.append(
                cls._make_chunk(
                    source_id="U2",
                    title="Đơn hàng gần đây",
                    kind="user_context",
                    content=" ".join(order_lines),
                    metadata={"source": "user_orders"},
                )
            )
        return chunks

    @classmethod
    def _make_chunk(cls, source_id: str, title: str, kind: str, content: str, metadata: Dict) -> RagChunk:
        return RagChunk(
            source_id=source_id,
            title=title,
            kind=kind,
            content=content,
            metadata=metadata,
            embedding=HashingEmbeddingModel.embed(f"{title}. {content}"),
        )

    @staticmethod
    def _keyword_overlap_score(query_terms: set, content: str) -> float:
        if not query_terms:
            return 0.0
        content_terms = set(HashingEmbeddingModel._tokens(normalize_text(content)))
        overlap = query_terms & content_terms
        return min(len(overlap) / max(len(query_terms), 1), 1.0) * 0.18

    @staticmethod
    def _dedupe_sources(sources: Sequence[RagSource]) -> List[RagSource]:
        seen = set()
        unique_sources = []
        for source in sources:
            if source.source_id in seen:
                continue
            seen.add(source.source_id)
            unique_sources.append(source)
        return unique_sources


def cosine_similarity(left: List[float], right: List[float]) -> float:
    if not left or not right:
        return 0.0
    return sum(left_value * right_value for left_value, right_value in zip(left, right))
