from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    shopId: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    shopId: Optional[int] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProductOut(ProductBase):
    id: int
    status:str
    createdAt: datetime
    class Config:
        from_attributes = True


class VariantBase(BaseModel):
    productId: int
    name: str
    price: float
    stock: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class VariantCreate(VariantBase):
    pass
class VariantUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class VariantOut(VariantBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True
class ProductImageBase(BaseModel):
    productId: int
    url: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class ProductImageCreate(ProductImageBase):
    pass
class ProductImageOut(ProductImageBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True
class ProduuctAttributeBase(BaseModel):
    productId: int
    key: str
    value: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class ProductAttributeCreate(ProduuctAttributeBase):
    pass
class ProductAttributeOut(ProduuctAttributeBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True
class VariantImageBase(BaseModel):
    variantId: int
    url: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class VariantImageCreate(VariantImageBase):
    pass
class VariantImageOut(VariantImageBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True
class ProductTagBase(BaseModel):
    productId: int
    tagId: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
class ProductTagCreate(ProductTagBase):
    pass
class ProductTagOut(ProductTagBase):
    id: int
    createdAt: datetime

    class Config:
        from_attributes = True