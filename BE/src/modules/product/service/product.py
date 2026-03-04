from fastapi import HTTPException
from src.core.database import Prisma
from src.modules.product.product_schema import ProductCreate, ProductOut, ProductUpdate
from datetime import datetime
class ProductService:
    @staticmethod
    async def create_product(product_data: ProductCreate) -> ProductOut:
        product = await Prisma.product.create(
            data={
                "name": product_data.name,
                "description": product_data.description,
                "price": product_data.price,
                "createdAt": datetime.utcnow()
            }
        )
        return ProductOut.from_orm(product)
    @staticmethod
    async def get_product(product_id: int) -> ProductOut:
        product = await Prisma.product.find_unique(where={"id": product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductOut.from_orm(product)
    @staticmethod
    async def get_all_products() -> list[ProductOut]:
        products = await Prisma.product.find_many()
        return [ProductOut.from_orm(product) for product in products]
    @staticmethod
    async def update_product(product_id: int, product_data: ProductUpdate) -> ProductOut:
        update_data = product_data.dict(exclude_unset=True)
        product = await Prisma.product.update(
            where={"id": product_id},
            data=update_data
        )
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return ProductOut.from_orm(product)
    @staticmethod
    async def delete_product(product_id: int):
        product = await Prisma.product.update( where={"id": product_id}, data={"deletedAt": datetime.utcnow()} )
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    