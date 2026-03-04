from fastapi import HTTPException
from src.core.database import Prisma
from src.modules.product.product_schema import ProductTagCreate, ProductTagOut
from datetime import datetime

class ProductTagService:
    @staticmethod
    async def create_product_tag(tag_data: ProductTagCreate) -> ProductTagOut:
        tag = await Prisma.productTag.create(
            data={
                "productId": tag_data.productId,
                "name": tag_data.name,
                "createdAt": datetime.utcnow()
            }
        )
        return ProductTagOut.from_orm(tag)
    @staticmethod
    async def get_product_tags(product_id: int) -> list[ProductTagOut]:
        tags = await Prisma.productTag.find_many(where={"productId": product_id})
        return [ProductTagOut.from_orm(tag) for tag in tags]
    @staticmethod
    async def delete_product_tag(tag_id: int):
        tag = await Prisma.productTag.update( where={"id": tag_id}, data={"deletedAt": datetime.utcnow()} )
        if not tag:
            raise HTTPException(status_code=404, detail="Product tag not found")
        return {"message": "Product tag deleted successfully"}
    