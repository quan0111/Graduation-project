import logging
from datetime import datetime

from fastapi import HTTPException

from src.core.cache import CacheManager
from src.core.database import prisma
from src.modules.product.service.product import ProductService


FLASH_SALE_STATUSES = {"DRAFT", "ACTIVE", "PAUSED", "ENDED"}
logger = logging.getLogger(__name__)


class FlashSaleService:
    @staticmethod
    def _normalize_status(status: str):
        normalized = status.upper()
        if normalized not in FLASH_SALE_STATUSES:
            raise HTTPException(400, "Invalid flash sale status")
        return normalized

    @staticmethod
    async def _invalidate_products(product_ids):
        for product_id in {product_id for product_id in product_ids if product_id}:
            try:
                await CacheManager.invalidate_product_cache(product_id)
            except Exception as exc:
                logger.warning("Failed to invalidate flash sale product cache for %s: %s", product_id, exc)

    @staticmethod
    async def _invalidate_flash_sale_products(flash_sale_id: int):
        items = await prisma.flashsaleitem.find_many(where={"flashSaleId": flash_sale_id})
        await FlashSaleService._invalidate_products([item.productId for item in items])

    @staticmethod
    async def list_flash_sales():
        return await prisma.flashsale.find_many(
            include={"items": True},
            order={"startsAt": "desc"},
        )

    @staticmethod
    async def list_active_public():
        now = datetime.utcnow()
        flash_sales = await prisma.flashsale.find_many(
            where={
                "status": "ACTIVE",
                "startsAt": {"lte": now},
                "endsAt": {"gte": now},
            },
            include={
                "items": {
                    "include": {
                        "product": {"include": ProductService.PRODUCT_INCLUDE},
                        "variant": {"include": {"images": True}},
                        "shop": True,
                    }
                }
            },
            order={"startsAt": "asc"},
        )

        public_sales = []
        for flash_sale in flash_sales:
            sale_data = flash_sale.model_dump()
            public_items = []

            for item in flash_sale.items or []:
                product = item.product
                shop = item.shop
                if not product or product.deletedAt or product.status != "ACTIVE":
                    continue
                if not shop or shop.deletedAt or not shop.isActive:
                    continue

                product_data = ProductService._serialize_product_dict(product)
                product_data.pop("flashSaleItems", None)
                for variant in product_data.get("variants", []) or []:
                    variant.pop("flashSaleItems", None)

                item_data = item.model_dump()
                item_data["product"] = product_data
                item_data["variant"] = item.variant.model_dump() if item.variant else None
                item_data["shop"] = shop.model_dump()
                public_items.append(item_data)

            sale_data["items"] = public_items
            if public_items:
                public_sales.append(sale_data)

        return public_sales

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
            },
            include={"items": True},
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

        flash_sale = await prisma.flashsale.update(
            where={"id": flash_sale_id},
            data=payload,
            include={"items": True},
        )
        await FlashSaleService._invalidate_flash_sale_products(flash_sale_id)
        return flash_sale

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

        item = await prisma.flashsaleitem.create(
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
        await FlashSaleService._invalidate_products([data.productId])
        return item

    @staticmethod
    def _validate_bulk_limits(data):
        if data.stockLimit is not None and data.stockLimit <= 0:
            raise HTTPException(400, "Stock limit must be greater than 0")
        if data.purchaseLimit is not None and data.purchaseLimit <= 0:
            raise HTTPException(400, "Purchase limit must be greater than 0")
        if data.discountPercent is not None and (data.discountPercent <= 0 or data.discountPercent >= 100):
            raise HTTPException(400, "Discount percent must be between 0 and 100")
        if data.salePrice is not None and data.salePrice <= 0:
            raise HTTPException(400, "Sale price must be greater than 0")

    @staticmethod
    def _bulk_sale_price(data, base_price: float, item_sale_price: float | None):
        if item_sale_price is not None:
            return float(item_sale_price)
        if data.salePrice is not None:
            return float(data.salePrice)
        if data.discountPercent is not None:
            return round(float(base_price) * (1 - float(data.discountPercent) / 100), 0)
        return None

    @staticmethod
    async def _upsert_flash_sale_item(flash_sale_id: int, target: dict, sale_price: float, stock_limit, purchase_limit):
        variant_id = target.get("variantId")
        existing = await prisma.flashsaleitem.find_first(
            where={
                "flashSaleId": flash_sale_id,
                "productId": target["productId"],
                "variantId": variant_id,
            }
        )

        if existing:
            await prisma.flashsaleitem.update(
                where={"id": existing.id},
                data={
                    "shop": {"connect": {"id": target["shopId"]}},
                    "salePrice": sale_price,
                    "stockLimit": stock_limit,
                    "purchaseLimit": purchase_limit,
                },
            )
            return "updated"

        create_data = {
            "flashSale": {"connect": {"id": flash_sale_id}},
            "product": {"connect": {"id": target["productId"]}},
            "shop": {"connect": {"id": target["shopId"]}},
            "salePrice": sale_price,
            "stockLimit": stock_limit,
            "purchaseLimit": purchase_limit,
        }
        if variant_id:
            create_data["variant"] = {"connect": {"id": variant_id}}

        await prisma.flashsaleitem.create(data=create_data)
        return "created"

    @staticmethod
    async def add_items_bulk(flash_sale_id: int, data):
        flash_sale = await prisma.flashsale.find_unique(where={"id": flash_sale_id})
        if not flash_sale:
            raise HTTPException(404, "Flash sale not found")

        FlashSaleService._validate_bulk_limits(data)

        raw_product_ids = {int(product_id) for product_id in data.productIds or [] if product_id}
        raw_category_ids = {int(category_id) for category_id in data.categoryIds or [] if category_id}
        targets = {}

        for product_id in raw_product_ids:
            targets[(product_id, None)] = {
                "productId": product_id,
                "variantId": None,
                "shopId": None,
                "salePrice": None,
            }

        for item in data.items or []:
            if not item.productId:
                continue
            targets[(int(item.productId), item.variantId)] = {
                "productId": int(item.productId),
                "variantId": item.variantId,
                "shopId": item.shopId,
                "salePrice": item.salePrice,
            }

        if raw_category_ids:
            category_products = await prisma.product.find_many(
                where={
                    "categoryId": {"in": list(raw_category_ids)},
                    "deletedAt": None,
                    "status": "ACTIVE",
                },
                include={"shop": True},
            )
            for product in category_products:
                targets.setdefault(
                    (product.id, None),
                    {
                        "productId": product.id,
                        "variantId": None,
                        "shopId": None,
                        "salePrice": None,
                    },
                )

        if not targets:
            raise HTTPException(400, "No products selected")

        if data.discountPercent is None and data.salePrice is None:
            missing_prices = [target for target in targets.values() if target.get("salePrice") is None]
            if missing_prices:
                raise HTTPException(400, "Discount percent or sale price is required")

        products = await prisma.product.find_many(
            where={
                "id": {"in": list({target["productId"] for target in targets.values()})},
                "deletedAt": None,
            },
            include={"shop": True, "variants": True},
        )
        product_by_id = {product.id: product for product in products}

        created = 0
        updated = 0
        errors = []
        results = []
        changed_product_ids = []

        for target in targets.values():
            product = product_by_id.get(target["productId"])
            if not product:
                errors.append({"productId": target["productId"], "variantId": target.get("variantId"), "reason": "Product not found"})
                continue
            if product.status != "ACTIVE":
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Product is not active"})
                continue
            if not product.shop or product.shop.deletedAt or not product.shop.isActive:
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Shop is not active"})
                continue

            variant = None
            if target.get("variantId"):
                variant = next((item for item in product.variants or [] if item.id == target["variantId"]), None)
                if not variant or variant.deletedAt:
                    errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Variant not found"})
                    continue

            shop_id = target.get("shopId") or product.shopId
            if shop_id != product.shopId:
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Shop does not match product"})
                continue

            base_price = float(variant.price if variant else product.price)
            if base_price <= 0:
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Product price must be greater than 0"})
                continue

            sale_price = FlashSaleService._bulk_sale_price(data, base_price, target.get("salePrice"))
            if sale_price is None or sale_price <= 0:
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Sale price must be greater than 0"})
                continue
            if sale_price >= base_price:
                errors.append({"productId": product.id, "variantId": target.get("variantId"), "reason": "Sale price must be lower than product price"})
                continue

            action = await FlashSaleService._upsert_flash_sale_item(
                flash_sale_id,
                {
                    "productId": product.id,
                    "variantId": target.get("variantId"),
                    "shopId": shop_id,
                },
                sale_price,
                data.stockLimit,
                data.purchaseLimit,
            )

            if action == "created":
                created += 1
            else:
                updated += 1
            changed_product_ids.append(product.id)
            results.append({"productId": product.id, "variantId": target.get("variantId"), "action": action})

        if changed_product_ids:
            await FlashSaleService._invalidate_products(changed_product_ids)

        return {
            "created": created,
            "updated": updated,
            "skipped": len(errors),
            "results": results,
            "errors": errors,
        }
