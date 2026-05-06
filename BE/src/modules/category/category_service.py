from src.core.database import prisma
from src.modules.category.category_schema import CategoryCreate, CategoryUpdate
from datetime import datetime
from fastapi import HTTPException


class CategoryService:

    async def create_category(category_data: CategoryCreate):
        data = category_data.dict()

        if data.get("parentId"):
            parent = await prisma.category.find_unique(
                where={"id": data["parentId"]}
            )
            if not parent:
                raise HTTPException(400, "Parent category not found")

        return await prisma.category.create(data=data)

    async def get_all_categories():
        return await prisma.category.find_many(
            where={"deletedAt": None},
            include={
                "parent": True,
                "children": True
            }
        )

    async def get_category(category_id: int):
        category = await prisma.category.find_unique(
            where={"id": category_id},
            include={
                "parent": True,
                "children": True
            }
        )
        if not category or category.deletedAt:
            raise HTTPException(404, "Category not found")
        return category

    async def update_category(category_id: int, category_data: CategoryUpdate):
        existing = await prisma.category.find_unique(where={"id": category_id})
        if not existing:
            raise HTTPException(404, "Category not found")

        data = category_data.dict(exclude_unset=True)

        if "parentId" in data:
            if data["parentId"] == category_id:
                raise HTTPException(400, "Cannot set itself as parent")

        return await prisma.category.update(
            where={"id": category_id},
            data=data
        )

    async def delete_category(category_id: int):
        existing = await prisma.category.find_unique(where={"id": category_id})
        if not existing:
            raise HTTPException(404, "Category not found")

        await prisma.category.update(
            where={"id": category_id},
            data={"deletedAt": datetime.utcnow()}
        )