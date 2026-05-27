from copy import deepcopy
from datetime import datetime, timezone

from fastapi import HTTPException

from src.core.cache import CacheManager, cache_invalidate, cache_result
from src.core.config import settings
from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService
from src.modules.product.product_schema import (
    ProductCreate,
    ProductOut,
    ProductUpdate,
    SellerProductCreate,
)


class ProductService:
    PRODUCT_INCLUDE = {
        "shop": True,
        "variants": {"include": {"images": True, "flashSaleItems": {"include": {"flashSale": True}}}},
        "tags": True,
        "category": True,
        "images": True,
        "attributes": True,
        "flashSaleItems": {"include": {"flashSale": True}},
    }

    @staticmethod
    def _is_admin(viewer) -> bool:
        return get_role_value(viewer) == "ADMIN"

    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    async def _get_shop_for_owner(user_id: int):
        return await prisma.shop.find_first(
            where={
                "ownerId": user_id,
                "deletedAt": None,
            }
        )

    @staticmethod
    def _viewer_proxy(user_id: int, role: str):
        return type("Viewer", (), {"id": user_id, "role": role})()

    @staticmethod
    async def _assert_product_access(product_id: int, viewer):
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not product or product.deletedAt:
            raise HTTPException(404, "Product not found")

        is_owner = bool(product.shop and product.shop.ownerId == viewer.id)
        if not ProductService._is_admin(viewer) and not is_owner:
            raise HTTPException(403, "Forbidden")

        return product

    @staticmethod
    async def _assert_product_image_access(image_id: int, viewer):
        image = await prisma.productimage.find_unique(
            where={"id": image_id},
            include={"product": {"include": {"shop": True}}},
        )
        if not image:
            raise HTTPException(404, "Image not found")

        product = image.product
        is_owner = bool(product and product.shop and product.shop.ownerId == viewer.id)
        if not ProductService._is_admin(viewer) and not is_owner:
            raise HTTPException(403, "Forbidden")

        return image

    @staticmethod
    def _build_product_payload(product_data: ProductCreate | SellerProductCreate, shop_id: int, status: str):
        variants = product_data.variants or []
        if not variants:
            raise HTTPException(400, "Product must have at least one variant so stock can be tracked")
        variant_prices = [variant.price for variant in variants if variant.price is not None]
        base_price = min(variant_prices) if variant_prices else getattr(product_data, "price", 0) or 0

        return {
            "name": product_data.name,
            "description": product_data.description,
            "price": base_price,
            "slug": product_data.slug,
            "status": status,
            "shop": {"connect": {"id": shop_id}},
            "category": {"connect": {"id": product_data.categoryId}},
            "variants": {
                "create": [
                    {
                        "name": variant.name,
                        "price": variant.price,
                        "stock": variant.stock,
                        "sku": getattr(variant, "sku", None),
                        "weight": getattr(variant, "weight", None),
                        "images": {
                            "create": [
                                {
                                    "url": image.url,
                                    "position": image.position,
                                }
                                for image in getattr(variant, "images", []) or []
                            ]
                        },
                    }
                    for variant in variants
                ]
            },
            "images": {
                "create": [
                    {
                        "url": image.url,
                        "position": image.position,
                        "isPrimary": getattr(image, "isPrimary", False),
                    }
                    for image in product_data.images or []
                ]
            },
            "attributes": {
                "create": [
                    {
                        "key": attribute.key,
                        "value": attribute.value,
                    }
                    for attribute in product_data.attributes or []
                ]
            },
            "tags": {
                "connect": [
                    {"id": tag_id}
                    for tag_id in product_data.tags or []
                ]
            },
        }

    @staticmethod
    async def _serialize_product(product_id: int) -> ProductOut:
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include=ProductService.PRODUCT_INCLUDE,
        )

        if not product:
            raise HTTPException(404, "Product not found")

        data = ProductService._serialize_product_dict(product)
        return ProductOut(**data)

    @staticmethod
    def _as_utc_naive(value):
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if value.tzinfo is not None:
            return value.astimezone(timezone.utc).replace(tzinfo=None)
        return value

    @staticmethod
    def _active_flash_sale_payload(items, now: datetime):
        active_items = []
        for item in items or []:
            flash_sale = item.get("flashSale") if isinstance(item, dict) else getattr(item, "flashSale", None)
            if not flash_sale:
                continue
            status = flash_sale.get("status") if isinstance(flash_sale, dict) else flash_sale.status
            starts_at = flash_sale.get("startsAt") if isinstance(flash_sale, dict) else flash_sale.startsAt
            ends_at = flash_sale.get("endsAt") if isinstance(flash_sale, dict) else flash_sale.endsAt
            starts_at = ProductService._as_utc_naive(starts_at)
            ends_at = ProductService._as_utc_naive(ends_at)
            if status != "ACTIVE" or starts_at > now or ends_at < now:
                continue
            active_items.append(item)

        if not active_items:
            return None

        item = min(active_items, key=lambda entry: float(entry.get("salePrice") if isinstance(entry, dict) else entry.salePrice))
        flash_sale = item.get("flashSale") if isinstance(item, dict) else item.flashSale
        return {
            "id": item.get("id") if isinstance(item, dict) else item.id,
            "flashSaleId": item.get("flashSaleId") if isinstance(item, dict) else item.flashSaleId,
            "variantId": item.get("variantId") if isinstance(item, dict) else item.variantId,
            "salePrice": float(item.get("salePrice") if isinstance(item, dict) else item.salePrice),
            "stockLimit": item.get("stockLimit") if isinstance(item, dict) else item.stockLimit,
            "soldCount": item.get("soldCount") if isinstance(item, dict) else item.soldCount,
            "purchaseLimit": item.get("purchaseLimit") if isinstance(item, dict) else item.purchaseLimit,
            "startsAt": flash_sale.get("startsAt") if isinstance(flash_sale, dict) else flash_sale.startsAt,
            "endsAt": flash_sale.get("endsAt") if isinstance(flash_sale, dict) else flash_sale.endsAt,
        }

    @staticmethod
    def _visible_positioned_items(items):
        return sorted(
            [item for item in items or [] if not item.get("deletedAt")],
            key=lambda item: item.get("position") or 0,
        )

    @staticmethod
    def _serialize_product_dict(product):
        data = deepcopy(product) if isinstance(product, dict) else product.model_dump()
        now = datetime.utcnow()
        data["variants"] = [variant for variant in data.get("variants") or [] if not variant.get("deletedAt")]
        data["tags"] = data.get("tags") or []
        data["images"] = ProductService._visible_positioned_items(data.get("images"))
        data["attributes"] = [attribute for attribute in data.get("attributes") or [] if not attribute.get("deletedAt")]
        product_level_sale = ProductService._active_flash_sale_payload(
            [item for item in data.get("flashSaleItems", []) if item.get("variantId") is None],
            now,
        )
        card_sale = ProductService._active_flash_sale_payload(data.get("flashSaleItems", []), now)
        data["activeFlashSale"] = card_sale or product_level_sale
        for variant in data["variants"]:
            variant["images"] = ProductService._visible_positioned_items(variant.get("images"))
            variant_sale = ProductService._active_flash_sale_payload(variant.get("flashSaleItems", []), now)
            variant["activeFlashSale"] = variant_sale or product_level_sale
        data["totalStock"] = sum((variant.get("stock") or 0) for variant in data["variants"])
        return data

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.SHOP_PRODUCTS}*")
    async def create_product(product_data: ProductCreate) -> ProductOut:
        product = await prisma.product.create(
            data=ProductService._build_product_payload(
                product_data,
                shop_id=product_data.shopId,
                status="DRAFT",
            )
        )
        return await ProductService._serialize_product(product.id)

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.SHOP_PRODUCTS}*")
    async def create_my_product(user_id: int, product_data: SellerProductCreate) -> ProductOut:
        shop = await ProductService._get_shop_for_owner(user_id)
        if not shop:
            raise HTTPException(404, "Shop not found")

        if not product_data.images or len(product_data.images) < 3:
            raise HTTPException(400, "At least 3 product images are required")

        if not product_data.variants:
            raise HTTPException(400, "At least 1 variant is required")

        product = await prisma.product.create(
            data=ProductService._build_product_payload(
                product_data,
                shop_id=shop.id,
                status="DRAFT",
            )
        )
        return await ProductService._serialize_product(product.id)

    @staticmethod
    @cache_result(CacheManager.PRODUCT_LIST, expire_seconds=CacheManager.MEDIUM_TTL)
    async def get_all_products(viewer_role: str | None = None, page: int = 1, limit: int = 24, search: str | None = None, category_id: int | None = None):
        where = {"deletedAt": None}

        if viewer_role != "ADMIN":
            where["status"] = "ACTIVE"
        if search and search.strip():
            keyword = search.strip()
            where["OR"] = [
                {"name": {"contains": keyword, "mode": "insensitive"}},
                {"description": {"contains": keyword, "mode": "insensitive"}},
            ]
        if category_id:
            where["categoryId"] = category_id

        products = await prisma.product.find_many(
            where=where,
            skip=(max(page, 1) - 1) * min(max(limit, 1), 100),
            take=min(max(limit, 1), 100),
            include=ProductService.PRODUCT_INCLUDE,
            order={"createdAt": "desc"},
        )

        return [ProductService._serialize_product_dict(product) for product in products]

    @staticmethod
    @cache_result(CacheManager.PRODUCT_DETAIL, expire_seconds=CacheManager.LONG_TTL)
    async def get_product_by_id(product_id: int, viewer=None) -> ProductOut:
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include=ProductService.PRODUCT_INCLUDE,
        )

        if not product or product.deletedAt is not None:
            raise HTTPException(404, "Product not found")

        if ProductService._to_value(product.status) != "ACTIVE":
            if not viewer:
                raise HTTPException(404, "Product not found")

            is_admin = ProductService._is_admin(viewer)
            is_owner = bool(product.shop and product.shop.ownerId == viewer.id)

            if not is_admin and not is_owner:
                raise HTTPException(404, "Product not found")

        data = ProductService._serialize_product_dict(product)
        return ProductOut(**data)

    @staticmethod
    @cache_result(CacheManager.SHOP_PRODUCTS, expire_seconds=CacheManager.MEDIUM_TTL)
    async def get_products_by_shop(shop_id: int, viewer=None):
        where = {"shopId": shop_id, "deletedAt": None}

        if not viewer or get_role_value(viewer) != "ADMIN":
            shop = await prisma.shop.find_unique(where={"id": shop_id})
            is_owner = bool(shop and viewer and shop.ownerId == viewer.id)
            if not is_owner:
                where["status"] = "ACTIVE"

        products = await prisma.product.find_many(
            where=where,
            include=ProductService.PRODUCT_INCLUDE,
        )

        return [ProductService._serialize_product_dict(product) for product in products]

    @staticmethod
    async def get_my_products(user_id: int):
        shop = await ProductService._get_shop_for_owner(user_id)
        if not shop:
            raise HTTPException(404, "Shop not found")

        viewer = ProductService._viewer_proxy(user_id, "SELLER")
        return await ProductService.get_products_by_shop(shop.id, viewer)

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.PRODUCT_DETAIL}*")
    @cache_invalidate(f"{CacheManager.SHOP_PRODUCTS}*")
    async def update_product(product_id: int, product_data: ProductUpdate, viewer) -> ProductOut:
        existing = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not existing or existing.deletedAt:
            raise HTTPException(404, "Product not found")

        is_admin = ProductService._is_admin(viewer)
        is_owner = bool(existing.shop and existing.shop.ownerId == viewer.id)
        if not is_admin and not is_owner:
            raise HTTPException(403, "Forbidden")

        data = product_data.model_dump(exclude_unset=True)
        update_data = {}
        previous_status = ProductService._to_value(existing.status)

        if "name" in data:
            update_data["name"] = data["name"]

        if "price" in data:
            update_data["price"] = data["price"]

        if "description" in data:
            update_data["description"] = data["description"]

        if "slug" in data:
            update_data["slug"] = data["slug"]

        if "shopId" in data:
            if not is_admin:
                raise HTTPException(403, "Only admin can move product to another shop")
            update_data["shop"] = {"connect": {"id": data["shopId"]}}

        if "categoryId" in data:
            update_data["category"] = {"connect": {"id": data["categoryId"]}}

        if "status" in data:
            if not is_admin and data["status"] != existing.status:
                raise HTTPException(403, "Only admin can change product status")
            update_data["status"] = data["status"]

        resubmit_for_review = (
            is_owner
            and not is_admin
            and previous_status == "REJECT"
            and any(key in update_data for key in ["name", "price", "description", "slug", "category"])
        )
        if resubmit_for_review:
            update_data["status"] = "APPROVAL"

        await prisma.product.update(
            where={"id": product_id},
            data=update_data,
        )

        if resubmit_for_review:
            case = await prisma.productmoderationcase.find_first(
                where={
                    "productId": product_id,
                    "status": {"in": ["OPEN", "SELLER_SUBMITTED", "UNDER_REVIEW", "REJECTED_UPHELD"]},
                },
                order={"createdAt": "desc"},
            )
            if case:
                await prisma.productmoderationcase.update(
                    where={"id": case.id},
                    data={
                        "status": "SELLER_SUBMITTED",
                        "sellerNote": "Seller đã chỉnh sửa sản phẩm bị từ chối và gửi duyệt lại.",
                        "resolvedAt": None,
                    },
                )
            else:
                await prisma.productmoderationcase.create(
                    data={
                        "productId": product_id,
                        "sellerId": viewer.id,
                        "status": "SELLER_SUBMITTED",
                        "reason": "Seller chỉnh sửa sản phẩm bị từ chối và gửi duyệt lại.",
                        "sellerNote": "Seller đã chỉnh sửa sản phẩm bị từ chối và gửi duyệt lại.",
                    }
                )
            await AuditService.create(
                actor_id=viewer.id,
                action="PRODUCT.RESUBMITTED_FOR_REVIEW",
                entity_type="Product",
                entity_id=product_id,
                severity="INFO",
                metadata={"from": previous_status, "to": "APPROVAL"},
            )

        return await ProductService._serialize_product(product_id)

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.PRODUCT_DETAIL}*")
    @cache_invalidate(f"{CacheManager.SHOP_PRODUCTS}*")
    async def delete_product(product_id: int, viewer):
        await ProductService._assert_product_access(product_id, viewer)
        await prisma.product.update(
            where={"id": product_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Product deleted successfully"}

    @staticmethod
    async def add_product_image(product_id: int, url: str, position: int = 1, isPrimary: bool = False, viewer=None):
        if viewer is not None:
            await ProductService._assert_product_access(product_id, viewer)
        else:
            product = await prisma.product.find_unique(where={"id": product_id})
            if not product:
                raise HTTPException(404, "Product not found")

        image = await prisma.productimage.create(
            data={
                "product": {"connect": {"id": product_id}},
                "url": url,
                "position": position,
                "isPrimary": isPrimary,
            }
        )
        await CacheManager.invalidate_product_cache(product_id)
        return image

    @staticmethod
    async def update_product_image(image_id: int, url: str = None, position: int = None, isPrimary: bool = None, viewer=None):
        if viewer is not None:
            await ProductService._assert_product_image_access(image_id, viewer)
        else:
            image = await prisma.productimage.find_unique(where={"id": image_id})
            if not image:
                raise HTTPException(404, "Image not found")

        data = {}
        if url is not None:
            data["url"] = url
        if position is not None:
            data["position"] = position
        if isPrimary is not None:
            data["isPrimary"] = isPrimary

        updated = await prisma.productimage.update(
            where={"id": image_id},
            data=data,
        )
        await CacheManager.invalidate_product_cache(updated.productId)
        return updated

    @staticmethod
    async def delete_product_image(image_id: int, viewer=None):
        if viewer is not None:
            image = await ProductService._assert_product_image_access(image_id, viewer)
        else:
            image = await prisma.productimage.find_unique(where={"id": image_id})
            if not image:
                raise HTTPException(404, "Image not found")

        await prisma.productimage.update(
            where={"id": image_id},
            data={"deletedAt": datetime.utcnow()}
        )
        await CacheManager.invalidate_product_cache(image.productId)

        return {"message": "Image deleted"}

    @staticmethod
    async def set_primary_image(image_id: int, viewer=None):
        image = await ProductService._assert_product_image_access(image_id, viewer) if viewer is not None else await prisma.productimage.find_unique(where={"id": image_id})
        if not image:
            raise HTTPException(404, "Image not found")

        await prisma.productimage.update_many(
            where={"productId": image.productId},
            data={"isPrimary": False}
        )

        await prisma.productimage.update(
            where={"id": image_id},
            data={"isPrimary": True}
        )
        await CacheManager.invalidate_product_cache(image.productId)

        return {"message": "Primary image updated"}

    @staticmethod
    async def reorder_product_images(product_id: int, image_orders: list, viewer=None):
        if viewer is not None:
            await ProductService._assert_product_access(product_id, viewer)

        for image in image_orders:
            await prisma.productimage.update(
                where={"id": image["id"]},
                data={"position": image["position"]}
            )
        await CacheManager.invalidate_product_cache(product_id)

        return {"message": "Images reordered"}
