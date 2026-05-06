from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from src.modules.category.category_schema import CategoryBase
from src.modules.shop.shop_schema import ShopOut


class ProductBase(BaseModel):
    name: str
    slug: Optional[str] = None
    categoryId: int
    description: Optional[str] = None
    price: float
    shopId: int

class ProductCreate(ProductBase):
    variants: Optional[List["VariantCreate"]] = []
    images: Optional[List["ProductImageCreate"]] = []
    attributes: Optional[List["ProductAttributeCreate"]] = []
    tags: Optional[List[int]] = [] 


class SellerProductCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    categoryId: int
    description: Optional[str] = None
    images: Optional[List["ProductImageCreate"]] = []
    attributes: Optional[List["ProductAttributeCreate"]] = []
    variants: Optional[List["VariantCreate"]] = []
    tags: Optional[List[int]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    categoryId: Optional[int] = None
    description: Optional[str] = None
    price: Optional[float] = None
    shopId: Optional[int] = None
    status: Optional[str] = None
class ProductOut(ProductBase):
    id: int
    status: str
    createdAt: datetime
    shop: Optional["ShopOut"] = None
    category: Optional["CategoryBase"] = None
    variants: Optional[List["VariantOut"]] = []
    images: Optional[List["ProductImageOut"]] = []
    attributes: Optional[List["ProductAttributeOut"]] = []
    tags: Optional[List["ProductTagOut"]] = []
    totalStock: Optional[int] = 0
    class Config:
        from_attributes = True

class VariantBase(BaseModel):
    sku: Optional[str] = None
    name: str
    price: float
    weight: Optional[float] = None
    stock: int

class VariantCreate(VariantBase):
    images: Optional[List["VariantImageCreate"]] = []  

class VariantUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[float] = None
    stock: Optional[int] = None
    images: Optional[List["VariantImageCreate"]] = None  
class VariantOut(VariantBase):
    id: int
    createdAt: datetime
    images: Optional[List["VariantImageOut"]] = []
    class Config:
        from_attributes = True


class ProductImageBase(BaseModel):
    url: str
    position: int
    isPrimary: Optional[bool] = False  
class ProductImageCreate(ProductImageBase):
    pass

class ProductImageOut(ProductImageBase):
    id: int
    createdAt: datetime
    class Config:
        from_attributes = True



class ProductAttributeBase(BaseModel):
    key: str
    value: str

class ProductAttributeCreate(ProductAttributeBase):
    pass

class ProductAttributeOut(ProductAttributeBase):
    id: int
    createdAt: datetime
    class Config:
        from_attributes = True

class VariantImageBase(BaseModel):
    url: str
    position: int

class VariantImageCreate(VariantImageBase):
    pass

class VariantImageOut(VariantImageBase):
    id: int
    createdAt: datetime
    class Config:
        from_attributes = True
class ProductTagBase(BaseModel):
    name: str

class ProductTagCreate(ProductTagBase):
    pass

class ProductTagOut(ProductTagBase):
    id: int

    class Config:
        from_attributes = True

