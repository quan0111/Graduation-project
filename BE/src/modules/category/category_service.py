from src.core.database import prisma
from src.modules.category.category_schema import CategoryCreate, CategoryUpdate
from datetime import datetime
from fastapi import HTTPException

class CategoryService:
    async def create_category(category_data: CategoryCreate):
        category_dict = category_data.dict()
        new_category = await prisma.category.create(data=category_dict)
        return new_category

    async def get_all_categories():
        categories = await prisma.category.find_many()
        return categories

    async def get_category(category_id: int):
        category = await prisma.category.find_unique(where={"id": category_id})
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        return category

    async def update_category(category_id: int, category_data: CategoryUpdate):
        update_data = category_data.dict(exclude_unset=True)
        updated_category = await prisma.category.update(where={"id": category_id}, data=update_data)
        return updated_category

    async def delete_category(category_id: int):
       await prisma.category.update(
    where={"id": category_id},
    data={"deletedAt": datetime.utcnow()}
)