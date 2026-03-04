from src.core.database import prisma


class ProductAttributeService:

    async def create(self, product_id: int, key: str, value: str):
        return await prisma.productattribute.create(
            data={
                "productId": product_id,
                "key": key,
                "value": value
            }
        )

    async def delete(self, attribute_id: int):
        return await prisma.productattribute.delete(
            where={"id": attribute_id}
        )