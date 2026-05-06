from fastapi import APIRouter, Depends
from typing import List

from src.core.dependencies import get_current_user, get_optional_current_user
from src.modules.product.product_schema import (
    ProductAttributeCreate,
    ProductAttributeOut,
    ProductImageCreate,
    ProductImageOut,
    ProductOut,
    ProductTagCreate,
    ProductTagOut,
    ProductUpdate,
    SellerProductCreate,
    VariantCreate,
    VariantImageCreate,
    VariantImageOut,
    VariantOut,
    VariantUpdate,
)
from src.modules.product.service.product import ProductService
from src.modules.product.service.product_tag import ProductTagService
from src.modules.product.service.variant import VariantService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductOut)
async def create_product(product_data: SellerProductCreate, user=Depends(get_current_user)):
    return await ProductService.create_my_product(user.id, product_data)


@router.get("/", response_model=List[ProductOut])
async def get_all_products(user=Depends(get_optional_current_user)):
    return await ProductService.get_all_products(user)


@router.get("/me", response_model=List[ProductOut])
async def get_my_products(user=Depends(get_current_user)):
    return await ProductService.get_my_products(user.id)


@router.get("/products-by-shop/{shop_id}", response_model=List[ProductOut])
async def get_products_by_shop(shop_id: int, user=Depends(get_optional_current_user)):
    return await ProductService.get_products_by_shop(shop_id, user)


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int, user=Depends(get_optional_current_user)):
    return await ProductService.get_product_by_id(product_id, user)


@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, product_data: ProductUpdate, user=Depends(get_current_user)):
    return await ProductService.update_product(product_id, product_data, user)


@router.patch("/{product_id}/delete")
async def delete_product(product_id: int):
    await ProductService.delete_product(product_id)
    return {"message": "Product deleted successfully"}


@router.post("/{product_id}/images", response_model=ProductImageOut)
async def add_product_image(product_id: int, image_data: ProductImageCreate):
    return await ProductService.add_product_image(product_id, image_data.url, image_data.position, image_data.isPrimary)


@router.patch("/images/{image_id}", response_model=ProductImageOut)
async def update_product_image(image_id: int, image_data: ProductImageCreate):
    return await ProductService.update_product_image(image_id, image_data.url, image_data.position, image_data.isPrimary)


@router.patch("/images/{image_id}/delete")
async def delete_product_image(image_id: int):
    await ProductService.delete_product_image(image_id)
    return {"message": "Product image deleted successfully"}


@router.patch("/images/{image_id}/primary")
async def set_primary_product_image(image_id: int):
    image = await ProductService.set_primary_image(image_id)
    return {"message": "Primary image set successfully", "data": image}


@router.patch("/{product_id}/reorder-images")
async def reorder_product_images(product_id: int, image_orders: list):
    await ProductService.reorder_product_images(product_id, image_orders)
    return {"message": "Product images reordered successfully"}


@router.get("/{product_id}/variants", response_model=List[VariantOut])
async def get_variants_by_product(product_id: int):
    return await VariantService.get_variants_by_product(product_id)


@router.post("/variants", response_model=VariantOut)
async def create_variant(variant_data: VariantCreate):
    return await VariantService.create_variant(variant_data)


@router.patch("/variants/{variant_id}", response_model=VariantOut)
async def update_variant(variant_id: int, variant_data: VariantUpdate):
    return await VariantService.update_variant(variant_id, variant_data)


@router.patch("/variants/{variant_id}/stock")
async def update_variant_stock(variant_id: int, quantity: int):
    return await VariantService.update_stock(variant_id, quantity)


@router.post("/{product_id}/generate-variants")
async def generate_variants(product_id: int, options: dict):
    return await VariantService.generate_variants(product_id, options)


@router.patch("/variants/{variant_id}/delete")
async def delete_variant(variant_id: int):
    await VariantService.delete_variant(variant_id)
    return {"message": "Variant deleted successfully"}


@router.post("/variants/{variant_id}/images", response_model=VariantImageOut)
async def add_variant_image(variant_id: int, image_data: VariantImageCreate):
    return await VariantService.add_variant_image(variant_id, image_data.url, image_data.position)


@router.get("/variants/images/{image_id}", response_model=VariantImageOut)
async def get_variant_image(image_id: int):
    return await VariantService.get_variant_images(image_id)


@router.patch("/variants/images/{image_id}", response_model=VariantImageOut)
async def update_variant_image(image_id: int, image_data: VariantImageCreate):
    return await VariantService.update_variant_image(image_id, image_data.url, image_data.position)


@router.patch("/variants/images/{image_id}/delete")
async def delete_variant_image(image_id: int):
    await VariantService.delete_variant_image(image_id)
    return {"message": "Variant image deleted successfully"}


@router.patch("/variants/images/{image_id}/primary")
async def set_primary_variant_image(image_id: int):
    await VariantService.set_primary_image(image_id)
    return {"message": "Primary variant image set successfully"}


@router.post("/tags", response_model=ProductTagOut)
async def create_product_tag(tag_data: ProductTagCreate):
    return await ProductTagService.create_product_tag(tag_data)


@router.delete("/tags/{tag_id}")
async def delete_product_tag(tag_id: int):
    await ProductTagService.delete_product_tag(tag_id)
    return {"message": "Product tag deleted successfully"}
