from src.core.database import prisma


class ProductImageService:

    async def create(self, product_id: int, url: str):
        return await prisma.productimage.create(
            data={
                "productId": product_id,
                "url": url
            }
        )

    async def delete(self, image_id: int):
        return await prisma.productimage.delete(
            where={"id": image_id}
        )