from fastapi import HTTPException
from datetime import datetime
from src.core.database import prisma
from src.modules.product.product_schema import ProductCreate, ProductOut, ProductUpdate


class ProductService:
    @staticmethod
    async def create_product(product_data: ProductCreate) -> ProductOut:
        product = await prisma.product.create(
            data={
                "name": product_data.name,
                "description": product_data.description,
                "price": product_data.price,
                "slug": product_data.slug,

                "shop": {"connect": {"id": product_data.shopId}},
                "category": {"connect": {"id": product_data.categoryId}},

                "variants": {
                    "create": [
                        {
                            "name": v.name,
                            "price": v.price,
                            "stock": v.stock,
                            "sku": getattr(v, "sku", None),
                            "weight": getattr(v, "weight", None),

                            "images": {
                                "create": [
                                    {
                                        "url": img.url,
                                        "position": img.position
                                    }
                                    for img in getattr(v, "images", []) or []
                                ]
                            }
                        }
                        for v in product_data.variants or []
                    ]
                },

                "images": {
                    "create": [
                        {
                            "url": img.url,
                            "position": img.position,
                            "isPrimary": getattr(img, "isPrimary", False)
                        }
                        for img in product_data.images or []
                    ]
                },

                "attributes": {
                    "create": [
                        {
                            "key": attr.key,
                            "value": attr.value
                        }
                        for attr in product_data.attributes or []
                    ]
                },

                # TAGS
                "tags": {
                    "connect": [
                        {"id": tag_id}
                        for tag_id in product_data.tags or []
                    ]
                }
            }
        )
        product_dict = product.model_dump()
        for field in ["variants", "images", "attributes", "tags"]:
            product_dict[field] = product_dict.get(field) or []
        product_dict["totalStock"] = sum(v.stock for v in product.variants)
        return ProductOut(**product_dict)
    @staticmethod
    async def get_product(product_id: int) -> ProductOut:
        product = await prisma.product.find_unique(
            where={"id": product_id, "deletedAt": None},
            include={
                "variants": {
                    "include": {
                        "images": True
                    }
                },
                "category": True,
                "images": True,
                "attributes": True,
                "tags": True,
            }
        )

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        total_stock = sum(v.stock for v in product.variants)

        product_dict = product.model_dump()

        for field in ["variants", "images", "attributes", "tags"]:
            product_dict[field] = product_dict.get(field) or []

        product_dict["totalStock"] = total_stock

        return ProductOut(**product_dict)

    @staticmethod
    async def get_all_products() -> list[ProductOut]:
        products = await prisma.product.find_many(
            where={"deletedAt": None},
            include={
                "shop": True,
                "variants": True,
                "tags": True,
                "category": True
            }
        )

        result = []
        for p in products:
            data = p.model_dump()

            # fix null
            data["variants"] = data.get("variants") or []
            data["tags"] = data.get("tags") or []

            result.append(ProductOut(**data))

        return result

    @staticmethod
    async def update_product(product_id: int, product_data: ProductUpdate) -> ProductOut:
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
            update_data["shop"] = {"connect": {"id": data["shopId"]}}

        if "categoryId" in data:
            update_data["category"] = {"connect": {"id": data["categoryId"]}}

        product = await prisma.product.update(
            where={"id": product_id},
            data=update_data
        )

        return ProductOut.from_orm(product)

    @staticmethod
    async def delete_product(product_id: int):
        await prisma.product.update(
            where={"id": product_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Product deleted successfully"}
    @staticmethod
    async def add_product_image(product_id: int, url: str, position: int = 1, isPrimary: bool = False):
        product = await prisma.product.find_unique(where={"id": product_id})
        if not product:
            raise HTTPException(404, "Product not found")

        return await prisma.productimage.create(
            data={
                "product": {"connect": {"id": product_id}},
                "url": url,
                "position": position,
                "isPrimary": isPrimary
            }
    )
    @staticmethod
    async def update_product_image(image_id: int, url: str = None, position: int = None, isPrimary: bool = None):
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
            data=data
        )
    @staticmethod
    async def delete_product_image(image_id: int):
        image = await prisma.productimage.find_unique(where={"id": image_id})
        if not image:
            raise HTTPException(404, "Image not found")

        await prisma.productimage.update(
            where={"id": image_id},
            data={"deletedAt": datetime.utcnow()}
        )

        return {"message": "Image deleted"}
    @staticmethod
    async def set_primary_image(product_id: int, image_id: int):
        await prisma.productimage.update_many(
            where={"productId": product_id},
            data={"isPrimary": False}
        )

        await prisma.productimage.update(
            where={"id": image_id},
            data={"isPrimary": True}
        )

        return {"message": "Primary image updated"}
    @staticmethod
    async def reorder_product_images(product_id: int, image_orders: list):
        for img in image_orders:
            await prisma.productimage.update(
                where={"id": img["id"]},
                data={"position": img["position"]}
            )

        return {"message": "Images reordered"}