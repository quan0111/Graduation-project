from fastapi import HTTPException
from src.core.database import prisma    
from src.modules.product.product_schema import ProductTagCreate, ProductTagOut
from datetime import datetime

class ProductTagService:
    @staticmethod
    async def create_product_tag(tag_data: ProductTagCreate) -> ProductTagOut:
        # tạo tag
        tag = await prisma.tag.create(
            data={
                "name": tag_data.name,
            }
        )
        await prisma.product.update(
            where={"id": tag_data.productId},
            data={
                "tags": {
                    "connect": [{"id": tag.id}]
                }
            }
        )
        return ProductTagOut.from_orm(tag)
    @staticmethod
    async def get_product_tags(product_id: int) -> list[ProductTagOut]:
        product = await prisma.product.find_unique(
            where={"id": product_id},
            include={"tags": True}
        )

        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        return [ProductTagOut.from_orm(tag) for tag in product.tags]
    @staticmethod
    async def remove_tag_from_product(product_id: int, tag_id: int):
        await prisma.product.update(
            where={"id": product_id},
            data={
                "tags": {
                    "disconnect": [{"id": tag_id}]
                }
            }
        )

        return {"message": "Tag removed from product"}
    @staticmethod
    async def delete_tag(tag_id: int):
        await prisma.tag.delete(where={"id": tag_id})
        return {"message": "Tag deleted"}