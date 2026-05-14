from typing import List, Optional

from pydantic import BaseModel, Field


class ChatbotMessageIn(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)
    productId: Optional[int] = None


class ChatbotProductOut(BaseModel):
    id: int
    name: str
    price: float
    imageUrl: Optional[str] = None
    shopName: Optional[str] = None
    categoryName: Optional[str] = None
    reason: Optional[str] = None
    relationType: Optional[str] = None


class ChatbotMessageOut(BaseModel):
    answer: str
    intent: str
    suggestions: List[str] = Field(default_factory=list)
    products: List[ChatbotProductOut] = Field(default_factory=list)


class ChatRequest(ChatbotMessageIn):
    pass

class ChatResponse(BaseModel):
    message: str
