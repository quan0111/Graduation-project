from typing import Dict, List, Sequence
import json

from src.ai.rag_engine import HashingEmbeddingModel
from src.core.database import prisma


class PGVectorStore:
    """Production vector store adapter for PostgreSQL + pgvector.

    The migration creates the table and index. Methods fail softly so local
    environments without pgvector can keep using the in-memory semantic fallback.
    """

    DIMENSIONS = HashingEmbeddingModel.DIMENSIONS

    @classmethod
    async def upsert_products(cls, products: Sequence) -> int:
        execute_raw = getattr(prisma, "execute_raw", None)
        if execute_raw is None:
            return 0

        written = 0
        for product in products:
            content = cls._product_content(product)
            embedding = HashingEmbeddingModel.embed(content)
            metadata = {
                "productId": product.id,
                "categoryId": getattr(product, "categoryId", None),
                "shopId": getattr(product, "shopId", None),
            }
            try:
                await execute_raw(
                    """
                    INSERT INTO "ProductEmbedding" ("productId", "content", "embedding", "metadata", "updatedAt")
                    VALUES ($1, $2, $3::vector, $4::jsonb, NOW())
                    ON CONFLICT ("productId")
                    DO UPDATE SET "content" = EXCLUDED."content",
                                  "embedding" = EXCLUDED."embedding",
                                  "metadata" = EXCLUDED."metadata",
                                  "updatedAt" = NOW()
                    """,
                    product.id,
                    content,
                    cls._vector_literal(embedding),
                    json.dumps(metadata),
                )
                written += 1
            except Exception:
                continue
        return written

    @classmethod
    async def search_products(cls, query: str, top_k: int = 40) -> Dict[int, float]:
        query_raw = getattr(prisma, "query_raw", None)
        if query_raw is None or not query.strip():
            return {}

        embedding = HashingEmbeddingModel.embed(query)
        try:
            rows = await query_raw(
                """
                SELECT "productId", 1 - ("embedding" <=> $1::vector) AS score
                FROM "ProductEmbedding"
                ORDER BY "embedding" <=> $1::vector
                LIMIT $2
                """,
                cls._vector_literal(embedding),
                top_k,
            )
        except Exception:
            return {}

        score_map: Dict[int, float] = {}
        for row in rows or []:
            product_id = row.get("productId") if isinstance(row, dict) else getattr(row, "productId", None)
            score = row.get("score") if isinstance(row, dict) else getattr(row, "score", None)
            if product_id is None or score is None:
                continue
            score_map[int(product_id)] = max(float(score), 0.0)
        return score_map

    @staticmethod
    def _vector_literal(embedding: List[float]) -> str:
        return "[" + ",".join(f"{value:.8f}" for value in embedding) + "]"

    @staticmethod
    def _product_content(product) -> str:
        category = getattr(getattr(product, "category", None), "name", "") or ""
        shop = getattr(getattr(product, "shop", None), "name", "") or ""
        tags = " ".join(getattr(tag, "name", "") for tag in getattr(product, "tags", []) or [])
        attributes = " ".join(
            f"{getattr(attribute, 'key', '')} {getattr(attribute, 'value', '')}"
            for attribute in getattr(product, "attributes", []) or []
        )
        return " ".join(
            part
            for part in [
                getattr(product, "name", "") or "",
                getattr(product, "description", "") or "",
                category,
                shop,
                tags,
                attributes,
                f"price {float(getattr(product, 'price', 0) or 0):.0f}",
            ]
            if part
        )
