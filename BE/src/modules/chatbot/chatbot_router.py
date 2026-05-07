from fastapi import APIRouter, Depends

from src.core.dependencies import get_optional_current_user
from src.modules.chatbot.chatbot_schema import ChatbotMessageIn, ChatbotMessageOut
from src.modules.chatbot.chatbot_service import ChatbotService

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=ChatbotMessageOut)
async def send_message(payload: ChatbotMessageIn, user=Depends(get_optional_current_user)):
    return await ChatbotService.answer(
        message=payload.message,
        user_id=user.id if user else None,
        product_id=payload.productId,
    )
