from fastapi import HTTPException
from src.core.database import Prisma
from src.modules.product.product_schema import VariantBase, VariantCreate, VariantOut, VariantUpdate
from datetime import datetime
class ProductService:
    @staticmethod
    async def create_variant(variant_data: VariantCreate) -> VariantOut:
        variant = await Prisma.variant.create(
            data={
                "productId": variant_data.productId,
                "name": variant_data.name,
                "price": variant_data.price,
                "createdAt": datetime.utcnow()
            }
        )
        return VariantOut.from_orm(variant)
    @staticmethod
    async def get_variant(variant_id: int) -> VariantOut:
        variant = await Prisma.variant.find_unique(where={"id": variant_id})
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")
        return VariantOut.from_orm(variant)
    @staticmethod
    async def get_variants_by_product(product_id: int) -> list[VariantOut]:
        variants = await Prisma.variant.find_many(where={"productId": product_id})
        return [VariantOut.from_orm(variant) for variant in variants]
    @staticmethod
    async def update_variant(variant_id: int, variant_data: VariantUpdate) -> VariantOut :
        update_data = variant_data.dict(exclude_unset=True)
        variant = await Prisma.variant.update(
            where={"id": variant_id},
            data=update_data
        )
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")
        return VariantOut.from_orm(variant)
    @staticmethod
    async def delete_variant(variant_id: int):
        variant = await Prisma.variant.update( where={"id": variant_id}, data={"deletedAt": datetime.utcnow()} )
        if not variant:
            raise HTTPException(status_code=404, detail="Variant not found")
        return {"message": "Variant deleted successfully"}
    