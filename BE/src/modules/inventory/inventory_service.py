from fastapi import HTTPException

from src.core.database import prisma
from src.core.dependencies import get_role_value


class InventoryService:
    LEDGER_INCLUDE = {
        "product": True,
        "variant": True,
    }

    @staticmethod
    async def get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(where={"ownerId": user_id, "deletedAt": None})
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

    @staticmethod
    async def record(client, data):
        payload = data.model_dump(exclude_none=True) if hasattr(data, "model_dump") else {k: v for k, v in data.items() if v is not None}
        return await client.inventoryledger.create(data=payload)

    @staticmethod
    async def list_for_shop(shop_id: int, limit: int = 100):
        return await prisma.inventoryledger.find_many(
            where={"shopId": shop_id},
            include=InventoryService.LEDGER_INCLUDE,
            order={"createdAt": "desc"},
            take=max(1, min(limit, 300)),
        )

    @staticmethod
    async def list_for_seller(user_id: int, limit: int = 100):
        shop = await InventoryService.get_seller_shop(user_id)
        return await InventoryService.list_for_shop(shop.id, limit)

    @staticmethod
    async def adjust_variant_stock(variant_id: int, quantity_change: int, reason: str, actor):
        variant = await prisma.productvariant.find_unique(
            where={"id": variant_id},
            include={"product": {"include": {"shop": True}}},
        )
        if not variant or variant.deletedAt:
            raise HTTPException(404, "Variant not found")

        role = get_role_value(actor)
        if role != "ADMIN" and (not variant.product or not variant.product.shop or variant.product.shop.ownerId != actor.id):
            raise HTTPException(403, "Forbidden")

        stock_before = int(variant.stock or 0)
        stock_after = stock_before + quantity_change
        if stock_after < 0:
            raise HTTPException(400, "Not enough stock")

        async with prisma.tx() as tx:
            updated = await tx.productvariant.update(
                where={"id": variant_id},
                data={"stock": stock_after},
            )
            await InventoryService.record(
                tx,
                {
                    "shopId": variant.product.shopId,
                    "productId": variant.productId,
                    "variantId": variant_id,
                    "actorId": actor.id,
                    "type": "MANUAL_ADJUSTMENT",
                    "quantityChange": quantity_change,
                    "stockBefore": stock_before,
                    "stockAfter": stock_after,
                    "reason": reason,
                },
            )

        return updated
