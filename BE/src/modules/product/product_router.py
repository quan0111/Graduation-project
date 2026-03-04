from fastapi import APIRouter
from typing import List
from src.modules.product.product_schema import ProductCreate, ProductUpdate, ProductOut,VariantCreate, VariantUpdate, VariantOut, ProductImageCreate, ProductImageOut, ProductAttributeCreate, ProductAttributeOut, VariantImageCreate, VariantImageOut, ProductTagCreate, ProductTagOut
from src.modules.product.service.product import ProductService
from src.modules.product.service.variant import ProductService as VariantService
from src.modules.product.service.product_attribute import ProductAttributeService
from src.modules.product.service.product_image import ProductImageService
from src.modules.product.service.variant_image import VariantImageService
from src.modules.product.service.product_tag import ProductTagService
router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductOut)
async def create_product(product_data: ProductCreate):
    new_product = await ProductService.create_product(product_data)
    return new_product
@router.get("/", response_model=List[ProductOut])
async def get_all_products():
    products = await ProductService.get_all_products()
    return products
@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: int):
    product = await ProductService.get_product(product_id)
    return product
@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, product_data: ProductUpdate):
    updated_product = await ProductService.update_product(product_id, product_data)
    return updated_product
@router.patch("/{product_id}/delete")
async def delete_product(product_id: int):
    await ProductService.delete_product(product_id)
    return {"message": "Product deleted successfully"}
@router.post("/variants", response_model=VariantOut)
async def create_variant(variant_data: VariantCreate):
    new_variant = await VariantService.create_variant(variant_data)
    return new_variant
@router.patch("/variants/{variant_id}", response_model=VariantOut)
async def update_variant(variant_id: int, variant_data: VariantUpdate):
    updated_variant = await VariantService.update_variant(variant_id, variant_data)
    return updated_variant
@router.delete("/variants/{variant_id}")
async def delete_variant(variant_id: int):
    await VariantService.delete_variant(variant_id)
    return {"message": "Variant deleted successfully"}
@router.post("/images", response_model=ProductImageOut)
async def create_product_image(image_data: ProductImageCreate):
    new_image = await ProductImageService.create(image_data)
    return new_image
@router.delete("/images/{image_id}")
async def delete_product_image(image_id: int):
    await ProductImageService.delete(image_id)
    return {"message": "Product image deleted successfully"}
@router.post("/attributes", response_model=ProductAttributeOut)
async def create_product_attribute(attribute_data: ProductAttributeCreate):
    new_attribute = await ProductAttributeService.create(attribute_data)
    return new_attribute
@router.delete("/attributes/{attribute_id}")
async def delete_product_attribute(attribute_id: int):
    await ProductAttributeService.delete(attribute_id)
    return {"message": "Product attribute deleted successfully"}
@router.post("/variant-images", response_model=VariantImageOut)
async def create_variant_image(image_data: VariantImageCreate):
    new_image = await VariantImageService.create_variant_image(image_data)
    return new_image
@router.delete("/variant-images/{image_id}")
async def delete_variant_image(image_id: int):
    await VariantImageService.delete_variant_image(image_id)
    return {"message": "Variant image deleted successfully"}
@router.post("/tags", response_model=ProductTagOut)
async def create_product_tag(tag_data: ProductTagCreate):
    new_tag = await ProductTagService.create_product_tag(tag_data)
    return new_tag
@router.delete("/tags/{tag_id}")
async def delete_product_tag(tag_id: int):
    await ProductTagService.delete_product_tag(tag_id)
    return {"message": "Product tag deleted successfully"}
@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, product_data: ProductUpdate):
    updated_product = await ProductService.update_product(product_id, product_data)
    return updated_product
@router.patch("/variants/{variant_id}", response_model=VariantOut)
async def update_variant(variant_id: int, variant_data: VariantUpdate):
    updated_variant = await VariantService.update_variant(variant_id, variant_data)
    return updated_variant
