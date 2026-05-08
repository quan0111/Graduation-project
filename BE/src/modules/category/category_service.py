
from datetime import datetime
from fastapi import HTTPException

from src.core.cache import CacheManager, cache_invalidate, cache_result
from src.core.database import prisma
from src.modules.category.category_schema import (
    CategoryCreate,
    CategoryUpdate,
)


class CategoryService:

    @staticmethod
    @cache_invalidate(f"{CacheManager.CATEGORY_LIST}*")
    async def create_category(category_data: CategoryCreate):
        data = category_data.dict()

        if data.get("parentId"):
            parent = await prisma.category.find_unique(
                where={"id": data["parentId"]}
            )

            if not parent:
                raise HTTPException(
                    status_code=400,
                    detail="Parent category not found"
                )

        existing_slug = await prisma.category.find_first(
            where={
                "slug": data["slug"],
                "deletedAt": None
            }
        )

        if existing_slug:
            raise HTTPException(
                status_code=400,
                detail="Slug already exists"
            )

        return await prisma.category.create(
            data=data,
            include={
                "parent": True,
                "children": True
            }
        )

    @staticmethod
    @cache_result(
        CacheManager.CATEGORY_LIST,
        expire_seconds=CacheManager.LONG_TTL
    )
    async def get_all_categories():
        return await prisma.category.find_many(
            where={
                "deletedAt": None
            },
            include={
                "parent": True,
                "children": True
            }
        )

    @staticmethod
    @cache_result(
        CacheManager.CATEGORY_DETAIL,
        expire_seconds=CacheManager.LONG_TTL
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
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        return category

    @staticmethod
    @cache_invalidate(f"{CacheManager.CATEGORY_LIST}*")
    @cache_invalidate(CacheManager.CATEGORY_DETAIL + ":{category_id}")
    async def update_category(
        category_id: int,
        category_data: CategoryUpdate
    ):
        existing = await prisma.category.find_unique(
            where={"id": category_id}
        )

        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        data = category_data.dict(exclude_unset=True)

        if "parentId" in data:
            if data["parentId"] == category_id:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot set itself as parent"
                )

            if data["parentId"]:
                parent = await prisma.category.find_unique(
                    where={"id": data["parentId"]}
                )

                if not parent:
                    raise HTTPException(
                        status_code=400,
                        detail="Parent category not found"
                    )

        if "slug" in data:
            existing_slug = await prisma.category.find_first(
                where={
                    "slug": data["slug"],
                    "id": {
                        "not": category_id
                    },
                    "deletedAt": None
                }
            )

            if existing_slug:
                raise HTTPException(
                    status_code=400,
                    detail="Slug already exists"
                )

        return await prisma.category.update(
            where={"id": category_id},
            data=data,
            include={
                "parent": True,
                "children": True
            }
        )

    @staticmethod
    @cache_invalidate(f"{CacheManager.CATEGORY_LIST}*")
    @cache_invalidate(CacheManager.CATEGORY_DETAIL + ":{category_id}")
    async def delete_category(category_id: int):
        existing = await prisma.category.find_unique(
            where={"id": category_id}
        )

        if not existing:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

        await prisma.category.update(
            where={"id": category_id},
            data={
                "deletedAt": datetime.utcnow()
            }
        )

        return {
            "message": "Category deleted successfully"
        }

