from datetime import datetime

from fastapi import HTTPException

from src.core.cache import CacheManager, cache_invalidate, cache_result
from src.core.config import settings
from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.product.product_schema import (
    ProductCreate,
    ProductOut,
    ProductUpdate,
    SellerProductCreate,
)


class ProductService:
    @staticmethod
    def _is_admin(viewer) -> bool:
        return get_role_value(viewer) == "ADMIN"

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
            include={
                "shop": True,
                "variants": {"include": {"images": True}},
                "tags": True,
                "category": True,
                "images": True,
                "attributes": True,
            },
        )

        if not product:
            raise HTTPException(404, "Product not found")

        data = product.model_dump()
        data["variants"] = data.get("variants") or []
        data["tags"] = data.get("tags") or []
        data["images"] = data.get("images") or []
        data["attributes"] = data.get("attributes") or []
        data["totalStock"] = sum((variant.get("stock") or 0) for variant in data["variants"])
        return ProductOut(**data)

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
    async def get_all_products(viewer=None, page: int = 1, limit: int = 24, search: str | None = None, category_id: int | None = None):
        where = {"deletedAt": None}

        if not viewer or get_role_value(viewer) != "ADMIN":
            where["status"] = "ACTIVE"
        if search:
            where["OR"] = [
                {"name": {"contains": search}},
                {"description": {"contains": search}},
            ]
        if category_id:
            where["categoryId"] = category_id

        products = await prisma.product.find_many(
            where=where,
            skip=(max(page, 1) - 1) * min(max(limit, 1), 100),
            take=min(max(limit, 1), 100),
            include={
                "shop": True,
                "variants": {"include": {"images": True}},
                "tags": True,
                "category": True,
                "images": True,
                "attributes": True,
            },
        )

        result = []
        for product in products:
            data = product.model_dump()
            data["variants"] = data.get("variants") or []
            data["tags"] = data.get("tags") or []
            data["images"] = data.get("images") or []
            data["attributes"] = data.get("attributes") or []
            data["totalStock"] = sum((variant.get("stock") or 0) for variant in data["variants"])
            result.append(data)

        return result

    @staticmethod
    @cache_result(CacheManager.PRODUCT_DETAIL, expire_seconds=CacheManager.LONG_TTL)
    async def get_product_by_id(product_id: int, viewer=None) -> ProductOut:
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={
                "shop": True,
                "variants": {"include": {"images": True}},
                "tags": True,
                "category": True,
                "images": True,
                "attributes": True,
            },
        )

        if not product or product.deletedAt is not None:
            raise HTTPException(404, "Product not found")

        if product.status != "ACTIVE":
            if not viewer:
                raise HTTPException(404, "Product not found")

            is_admin = ProductService._is_admin(viewer)
            is_owner = bool(product.shop and product.shop.ownerId == viewer.id)

            if not is_admin and not is_owner:
                raise HTTPException(404, "Product not found")

        data = product.model_dump()
        data["variants"] = data.get("variants") or []
        data["tags"] = data.get("tags") or []
        data["images"] = data.get("images") or []
        data["attributes"] = data.get("attributes") or []
        data["totalStock"] = sum((variant.get("stock") or 0) for variant in data["variants"])
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
            include={
                "shop": True,
                "variants": {"include": {"images": True}},
                "tags": True,
                "category": True,
                "images": True,
                "attributes": True,
            },
        )

        result = []
        for product in products:
            data = product.model_dump()
            data["variants"] = data.get("variants") or []
            data["tags"] = data.get("tags") or []
            data["images"] = data.get("images") or []
            data["attributes"] = data.get("attributes") or []
            data["totalStock"] = sum((variant.get("stock") or 0) for variant in data["variants"])
            result.append(data)

        return result

    @staticmethod
    async def get_my_products(user_id: int):
        shop = await ProductService._get_shop_for_owner(user_id)
        if not shop:
            raise HTTPException(404, "Shop not found")

        viewer = ProductService._viewer_proxy(user_id, "SELLER")
        return await ProductService.get_products_by_shop(shop.id, viewer)

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.PRODUCT_DETAIL}:"+"{product_id}")
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

        await prisma.product.update(
            where={"id": product_id},
            data=update_data,
        )

        return await ProductService._serialize_product(product_id)

    @staticmethod
    @cache_invalidate(f"{CacheManager.PRODUCT_LIST}*")
    @cache_invalidate(f"{CacheManager.PRODUCT_DETAIL}:"+"{product_id}")
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

        return await prisma.productimage.create(
            data={
                "product": {"connect": {"id": product_id}},
                "url": url,
                "position": position,
                "isPrimary": isPrimary,
            }
        )

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

        return await prisma.productimage.update(
            where={"id": image_id},
            data=data,
        )

    @staticmethod
    async def delete_product_image(image_id: int, viewer=None):
        if viewer is not None:
            await ProductService._assert_product_image_access(image_id, viewer)
        else:
            image = await prisma.productimage.find_unique(where={"id": image_id})
            if not image:
                raise HTTPException(404, "Image not found")

        await prisma.productimage.update(
            where={"id": image_id},
            data={"deletedAt": datetime.utcnow()}
        )

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

        return {"message": "Images reordered"}
