from fastapi import APIRouter
from typing import List
from src.modules.product.product_schema import ProductCreate, ProductUpdate, ProductOut,VariantCreate, VariantUpdate, VariantOut, ProductImageCreate, ProductImageOut, ProductAttributeCreate, ProductAttributeOut, VariantImageCreate, VariantImageOut, ProductTagCreate, ProductTagOut
from src.modules.product.service.product import ProductService
from src.modules.product.service.variant import VariantService
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
    product = await ProductService.get_product_by_id(product_id)
    return product
@router.get("/products-by-shop/{shop_id}", response_model=List[ProductOut]) 
async def get_products_by_shop(shop_id: int):
    products = await ProductService.get_products_by_shop(shop_id)
    return products
@router.patch("/{product_id}", response_model=ProductOut)
async def update_product(product_id: int, product_data: ProductUpdate):
    updated_product = await ProductService.update_product(product_id, product_data)
    return updated_product
@router.patch("/{product_id}/delete")
async def delete_product(product_id: int):
    await ProductService.delete_product(product_id)
    return {"message": "Product deleted successfully"}
@router.post("/{product_id}/images", response_model=ProductImageOut)
async def add_product_image(product_id: int, image_data: ProductImageCreate):
    new_image = await ProductService.add_product_image(product_id, image_data.url, image_data.position, image_data.isPrimary)
    return new_image
@router.patch("/images/{image_id}", response_model=ProductImageOut)
async def update_product_image(image_id: int, image_data: ProductImageCreate):
    updated_image = await ProductService.update_product_image(image_id, image_data.url, image_data.position, image_data.isPrimary)
    return updated_image
@router.patch("/images/{image_id}/delete")
async def delete_product_image(image_id: int):
    await ProductService.delete_product_image(image_id)
    return {"message": "Product image deleted successfully"}
@router.patch("/images/{image_id}/primary")
async def set_primary_product_image(image_id: int):
    image = await ProductService.set_primary_image(image_id)
    return {"message": "Primary image set successfully"}
@router.patch("/{product_id}/reorder-images")
async def reorder_product_images(product_id: int, image_orders: list):
    await ProductService.reorder_product_images(product_id, image_orders)
    return {"message": "Product images reordered successfully"}

@router.get("/{product_id}/variants", response_model=List[VariantOut])
async def get_variants_by_product(product_id: int):
    variants = await VariantService.get_variants_by_product(product_id)
    return variants
@router.post("/variants", response_model=VariantOut)
async def create_variant(variant_data: VariantCreate):
    new_variant = await VariantService.create_variant(variant_data)
    return new_variant
@router.patch("/variants/{variant_id}", response_model=VariantOut)
async def update_variant(variant_id: int, variant_data: VariantUpdate):
    updated_variant = await VariantService.update_variant(variant_id, variant_data)
    return updated_variant
@router.patch("/variants/{variant_id}/stock")
async def update_variant_stock(variant_id: int, quantity: int):
    result = await VariantService.update_stock(variant_id, quantity)
    return result
@router.post("/{product_id}/generate-variants")
async def generate_variants(product_id: int, options: dict):
    result = await VariantService.generate_variants(product_id, options)
    return result
@router.patch("/variants/{variant_id}/delete")
async def delete_variant(variant_id: int):
    await VariantService.delete_variant(variant_id)
    return {"message": "Variant deleted successfully"}
@router.post("/variants/{variant_id}/images", response_model=VariantImageOut)
async def add_variant_image(variant_id: int, image_data: VariantImageCreate):
    new_image = await VariantService.add_variant_image(variant_id, image_data.url, image_data.position)
    return new_image
@router.get("/variants/images/{image_id}", response_model=VariantImageOut)
async def get_variant_image(image_id: int):
    image = await VariantService.get_variant_images(image_id)
    return image
@router.patch("/variants/images/{image_id}", response_model=VariantImageOut)
async def update_variant_image(image_id: int, image_data: VariantImageCreate):
    updated_image = await VariantService.update_variant_image(image_id, image_data.url, image_data.position)
    return updated_image
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
    new_tag = await ProductTagService.create_product_tag(tag_data)
    return new_tag
@router.delete("/tags/{tag_id}")
async def delete_product_tag(tag_id: int):
    await ProductTagService.delete_product_tag(tag_id)
    return {"message": "Product tag deleted successfully"}


