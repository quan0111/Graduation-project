from fastapi import HTTPException
from src.core.database import Prisma
from src.modules.product.product_schema import VariantImageCreate, VariantImageOut
from datetime import datetime

class VariantImageService:
    @staticmethod
    async def create_variant_image(image_data: VariantImageCreate) -> VariantImageOut:
        image = await Prisma.variantImage.create(
            data={
                "variantId": image_data.variantId,
                "url": image_data.url,
                "createdAt": datetime.utcnow()
            }
        )
        return VariantImageOut.from_orm(image)
    @staticmethod
    async def get_variant_images(variant_id: int) -> list[VariantImageOut]:
        images = await Prisma.variantImage.find_many(where={"variantId": variant_id})
        return [VariantImageOut.from_orm(image) for image in images]
    @staticmethod
    async def delete_variant_image(image_id: int):  
        image = await Prisma.variantImage.update( where={"id": image_id}, data={"deletedAt": datetime.utcnow()} )
        if not image:
            raise HTTPException(status_code=404, detail="Variant image not found")
        return {"message": "Variant image deleted successfully"}
    @staticmethod
    async def get_variant_image(image_id: int) -> VariantImageOut:
        image = await Prisma.variantImage.find_unique(where={"id": image_id})
        if not image:
            raise HTTPException(status_code=404, detail="Variant image not found")
        return VariantImageOut.from_orm(image)
