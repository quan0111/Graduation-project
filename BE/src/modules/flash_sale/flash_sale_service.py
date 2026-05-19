from fastapi import HTTPException

from src.core.database import prisma


FLASH_SALE_STATUSES = {"DRAFT", "ACTIVE", "PAUSED", "ENDED"}


class FlashSaleService:
    @staticmethod
    def _normalize_status(status: str):
        normalized = status.upper()
        if normalized not in FLASH_SALE_STATUSES:
            raise HTTPException(400, "Invalid flash sale status")
        return normalized

    @staticmethod
    async def list_flash_sales():
        return await prisma.flashsale.find_many(
            include={"items": True},
            order={"startsAt": "desc"},
        )

    @staticmethod
    async def create_flash_sale(data):
        if data.endsAt <= data.startsAt:
            raise HTTPException(400, "Flash sale end time must be after start time")
        return await prisma.flashsale.create(
            data={
                "name": data.name,
                "startsAt": data.startsAt,
                "endsAt": data.endsAt,
                "status": FlashSaleService._normalize_status(data.status),
            }
        )

    @staticmethod
    async def update_flash_sale(flash_sale_id: int, data):
        flash_sale = await prisma.flashsale.find_unique(where={"id": flash_sale_id})
        if not flash_sale:
            raise HTTPException(404, "Flash sale not found")

        payload = data.model_dump(exclude_unset=True)
        if "status" in payload and payload["status"]:
            payload["status"] = FlashSaleService._normalize_status(payload["status"])
        starts_at = payload.get("startsAt", flash_sale.startsAt)
        ends_at = payload.get("endsAt", flash_sale.endsAt)
        if ends_at <= starts_at:
            raise HTTPException(400, "Flash sale end time must be after start time")

        return await prisma.flashsale.update(
            where={"id": flash_sale_id},
            data=payload,
        )

    @staticmethod
    async def add_item(flash_sale_id: int, data):
        flash_sale = await prisma.flashsale.find_unique(where={"id": flash_sale_id})
        if not flash_sale:
            raise HTTPException(404, "Flash sale not found")

        product = await prisma.product.find_unique(where={"id": data.productId})
        if not product or product.deletedAt:
            raise HTTPException(404, "Product not found")
        if product.shopId != data.shopId:
            raise HTTPException(400, "Shop does not match product")

        if data.variantId:
            variant = await prisma.productvariant.find_unique(where={"id": data.variantId})
            if not variant or variant.productId != data.productId:
                raise HTTPException(400, "Variant does not match product")

        return await prisma.flashsaleitem.create(
            data={
                "flashSale": {"connect": {"id": flash_sale_id}},
                "product": {"connect": {"id": data.productId}},
                "variant": {"connect": {"id": data.variantId}} if data.variantId else None,
                "shop": {"connect": {"id": data.shopId}},
                "salePrice": data.salePrice,
                "stockLimit": data.stockLimit,
                "purchaseLimit": data.purchaseLimit,
            }
        )
