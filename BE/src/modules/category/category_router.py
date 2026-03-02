from fastapi import APIRouter
from typing import List
from src.modules.category.category_service import CategoryService
from src.modules.category.category_schema import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("/", response_model=CategoryOut)
async def create_category(category_data: CategoryCreate):
    new_category = await CategoryService.create_category(category_data)
    return new_category
@router.get("/", response_model=List[CategoryOut])
async def get_all_categories():
    categories = await CategoryService.get_all_categories()
    return categories
@router.get("/{category_id}", response_model=CategoryOut)
async def get_category(category_id: int):
    category = await CategoryService.get_category(category_id)
    return category
@router.patch("/{category_id}", response_model=CategoryOut)
async def update_category(category_id: int, category_data: CategoryUpdate):
    updated_category = await CategoryService.update_category(category_id, category_data)
    return updated_category
@router.patch("/{category_id}/delete")
async def delete_category(category_id: int):
    await CategoryService.delete_category(category_id)
    return {"message": "Category deleted successfully"}