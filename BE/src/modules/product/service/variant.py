from fastapi import HTTPException
from src.core.database import prisma
from src.modules.product.product_schema import VariantCreate, VariantUpdate, VariantOut
from datetime import datetime
from itertools import product

class VariantService:
    @staticmethod
    async def create_variant(data: VariantCreate) -> VariantOut:
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
    async def update_variant(variant_id: int, data: VariantUpdate) -> VariantOut:
        variant = await prisma.productvariant.find_unique(where={"id": variant_id})
        if not variant:
            raise HTTPException(404, "Variant not found")

        update_data = data.model_dump(exclude_unset=True)

        updated = await prisma.productvariant.update(
            where={"id": variant_id},
            data=update_data
        )

        return VariantOut.from_orm(updated)
    @staticmethod
    async def update_stock(variant_id: int, quantity: int):
        variant = await prisma.productvariant.find_unique(where={"id": variant_id})
        if not variant:
            raise HTTPException(404, "Variant not found")

        new_stock = variant.stock + quantity

        if new_stock < 0:
            raise HTTPException(400, "Not enough stock")

        await prisma.productvariant.update(
            where={"id": variant_id},
            data={"stock": new_stock}
        )

        return {"message": "Stock updated", "newStock": new_stock}
    @staticmethod
    async def generate_variants(product_id: int, options: dict):
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
    async def delete_variant(variant_id: int):
        variant = await prisma.productvariant.find_unique(where={"id": variant_id})
        if not variant:
            raise HTTPException(404, "Variant not found")

        await prisma.productvariant.update(
            where={"id": variant_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Variant deleted"}

    @staticmethod
    async def add_variant_image(variant_id: int, url: str, position: int = 1):
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
    async def update_variant_image(image_id: int, url: str = None, position: int = None):
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
    async def delete_variant_image(image_id: int):
        image = await prisma.variantimage.find_unique(where={"id": image_id})
        if not image:
            raise HTTPException(404, "Image not found")

        await prisma.variantimage.update(
            where={"id": image_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Image deleted"}

    @staticmethod
    async def set_primary_image(variant_id: int, image_id: int):
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
    async def reorder_images(variant_id: int, image_orders: list):
        for img in image_orders:
            await prisma.variantimage.update(
                where={"id": img["id"]},
                data={"position": img["position"]}
            )

        return {"message": "Images reordered"}
