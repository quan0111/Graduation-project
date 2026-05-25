from datetime import datetime
from itertools import product
from fastapi import HTTPException

from src.core.cache import CacheManager
from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.product.product_schema import VariantCreate, VariantOut, VariantUpdate

class VariantService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    async def _assert_variant_access(variant_id: int, viewer) -> tuple:
        variant = await prisma.productvariant.find_unique(
            where={"id": variant_id},
            include={"product": {"include": {"shop": True}}},
        )
        if not variant:
            raise HTTPException(404, "Variant not found")

        if get_role_value(viewer) == "ADMIN":
            return variant, variant.product

        is_owner = bool(variant.product and variant.product.shop and variant.product.shop.ownerId == viewer.id)
        if not is_owner:
            raise HTTPException(403, "Forbidden")

        return variant, variant.product

    @staticmethod
    async def _assert_product_access(product_id: int, viewer):
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"shop": True},
        )
        if not product:
            raise HTTPException(404, "Product not found")
        if get_role_value(viewer) != "ADMIN" and product.shop.ownerId != viewer.id:
            raise HTTPException(403, "Forbidden")
        return product

    @staticmethod
    async def create_variant(data: VariantCreate, viewer=None) -> VariantOut:
        if not data.productId:
            raise HTTPException(400, "productId is required")
        if viewer is not None:
            await VariantService._assert_product_access(data.productId, viewer)
        else:
            product = await prisma.product.find_unique(where={"id": data.productId})
            if not product:
                raise HTTPException(404, "Product not found")

        variant = await prisma.productvariant.create(
            data={
                "product": {"connect": {"id": data.productId}},
                "name": data.name,
                "price": data.price,
                "sku": data.sku,
                "weight": data.weight,
                "stock": data.stock,

                "images": {
                    "create": [
                        {
                            "url": img.url,
                            "position": img.position
                        }
                        for img in data.images or []
                    ]
                }
            },
            include={"images": True}
        )

        return VariantOut.from_orm(variant)

    @staticmethod
    async def update_variant(variant_id: int, data: VariantUpdate, viewer=None) -> VariantOut:
        if viewer is not None:
            variant, product = await VariantService._assert_variant_access(variant_id, viewer)
        else:
            variant = await prisma.productvariant.find_unique(where={"id": variant_id})
            if not variant:
                raise HTTPException(404, "Variant not found")
            product = await prisma.product.find_unique(where={"id": variant.productId})

        update_data = data.model_dump(exclude_unset=True)
        update_data.pop("images", None)
        if "price" in update_data and update_data["price"] is not None and update_data["price"] <= 0:
            raise HTTPException(400, "Variant price must be greater than 0")
        if "stock" in update_data and update_data["stock"] is not None and update_data["stock"] < 0:
            raise HTTPException(400, "Variant stock cannot be negative")

        updated = await prisma.productvariant.update(
            where={"id": variant_id},
            data=update_data,
            include={"images": True},
        )

        if "price" in update_data and product:
            variants = await prisma.productvariant.find_many(
                where={"productId": product.id, "deletedAt": None},
            )
            prices = [item.price for item in variants if item.price is not None and item.price > 0]
            if prices:
                await prisma.product.update(
                    where={"id": product.id},
                    data={"price": min(prices)},
                )
            await CacheManager.invalidate_product_cache(product.id)

        return VariantOut.from_orm(updated)
    @staticmethod
    async def update_stock(variant_id: int, quantity: int, viewer=None):
        if viewer is not None:
            variant, product = await VariantService._assert_variant_access(variant_id, viewer)
        else:
            variant = await prisma.productvariant.find_unique(where={"id": variant_id})
            product = None

        if not variant:
            raise HTTPException(404, "Variant not found")

        new_stock = (variant.stock or 0) + quantity
        if new_stock < 0:
            raise HTTPException(400, "Not enough stock")

        await prisma.productvariant.update(
            where={"id": variant_id},
            data={"stock": new_stock}
        )

        if product:
            variants = await prisma.productvariant.find_many(
                where={"productId": product.id, "deletedAt": None}
            )
            total_stock = sum((item.stock or 0) for item in variants)
            current_status = VariantService._to_value(product.status)
            new_status = "ACTIVE" if total_stock > 0 and current_status == "OUT_OF_STOCK" else current_status
            if total_stock <= 0 and current_status == "ACTIVE":
                new_status = "OUT_OF_STOCK"

            if new_status != current_status:
                await prisma.product.update(
                    where={"id": product.id},
                    data={"status": new_status},
                )

        return {"message": "Stock updated", "newStock": new_stock}
    @staticmethod
    async def generate_variants(product_id: int, options: dict, viewer=None):
        if viewer is not None:
            await VariantService._assert_product_access(product_id, viewer)
        else:
            product_check = await prisma.product.find_unique(where={"id": product_id})
            if not product_check:
                raise HTTPException(404, "Product not found")

        combinations = list(product(*options.values()))

        created = []

        for combo in combinations:
            name = " - ".join(combo)

            variant = await prisma.productvariant.create(
                data={
                    "product": {"connect": {"id": product_id}},
                    "name": name,
                    "price": 0,
                    "stock": 0
                }
            )

            created.append(variant)

        return created
    @staticmethod
    async def get_variants_by_product(product_id: int) -> list[VariantOut]:
        variants = await prisma.productvariant.find_many(
            where={"productId": product_id, "deletedAt": None},
            include={"images": True}
        )

        return [VariantOut.from_orm(v) for v in variants]

    @staticmethod
    async def delete_variant(variant_id: int, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_access(variant_id, viewer)
        else:
            variant = await prisma.productvariant.find_unique(where={"id": variant_id})
            if not variant:
                raise HTTPException(404, "Variant not found")

        await prisma.productvariant.update(
            where={"id": variant_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Variant deleted"}

    @staticmethod
    async def add_variant_image(variant_id: int, url: str, position: int = 1, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_access(variant_id, viewer)
        else:
            variant = await prisma.productvariant.find_unique(where={"id": variant_id})
            if not variant:
                raise HTTPException(404, "Variant not found")

        return await prisma.variantimage.create(
            data={
                "variant": {"connect": {"id": variant_id}},
                "url": url,
                "position": position
            }
        )

    @staticmethod
    async def get_variant_images(variant_id: int):
        return await prisma.variantimage.find_many(
            where={
                "variantId": variant_id,
                "deletedAt": None
            },
            order={"position": "asc"}
        )

    @staticmethod
    async def get_variant_image(image_id: int):
        image = await prisma.variantimage.find_first(
            where={"id": image_id, "deletedAt": None}
        )
        if not image:
            raise HTTPException(404, "Image not found")
        return image

    @staticmethod
    async def _assert_variant_image_access(image_id: int, viewer):
        image = await prisma.variantimage.find_unique(
            where={"id": image_id},
            include={"variant": {"include": {"product": {"include": {"shop": True}}}}},
        )
        if not image:
            raise HTTPException(404, "Image not found")
        shop = image.variant.product.shop
        if get_role_value(viewer) != "ADMIN" and shop.ownerId != viewer.id:
            raise HTTPException(403, "Forbidden")
        return image

    @staticmethod
    async def update_variant_image(image_id: int, url: str = None, position: int = None, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_image_access(image_id, viewer)
        else:
            image = await prisma.variantimage.find_unique(where={"id": image_id})
            if not image:
                raise HTTPException(404, "Image not found")

        data = {}

        if url is not None:
            data["url"] = url

        if position is not None:
            data["position"] = position

        return await prisma.variantimage.update(
            where={"id": image_id},
            data=data
        )

    @staticmethod
    async def delete_variant_image(image_id: int, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_image_access(image_id, viewer)
        else:
            image = await prisma.variantimage.find_unique(where={"id": image_id})
            if not image:
                raise HTTPException(404, "Image not found")

        await prisma.variantimage.update(
            where={"id": image_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Image deleted"}

    @staticmethod
    async def set_primary_image(variant_id: int, image_id: int, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_access(variant_id, viewer)
            await VariantService._assert_variant_image_access(image_id, viewer)

        await prisma.variantimage.update_many(
            where={"variantId": variant_id},
            data={"position": 99}
        )

        await prisma.variantimage.update(
            where={"id": image_id},
            data={"position": 1}
        )

        return {"message": "Primary image updated"}
    @staticmethod
    async def reorder_images(variant_id: int, image_orders: list, viewer=None):
        if viewer is not None:
            await VariantService._assert_variant_access(variant_id, viewer)

        for img in image_orders:
            await prisma.variantimage.update(
                where={"id": img["id"]},
                data={"position": img["position"]}
            )

        return {"message": "Images reordered"}
