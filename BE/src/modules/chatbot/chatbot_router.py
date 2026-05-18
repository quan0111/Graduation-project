from fastapi import APIRouter, Depends

from src.core.dependencies import get_optional_current_user
from src.modules.chatbot.chatbot_schema import ChatbotMessageIn, ChatbotMessageOut, ChatRequest, ChatResponse
from src.modules.chatbot.chatbot_service import ChatService

router = APIRouter()

chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
legacy_router = APIRouter(prefix="/chat", tags=["Chat"])


@chatbot_router.post("/message", response_model=ChatbotMessageOut)
async def send_message(payload: ChatbotMessageIn, user=Depends(get_optional_current_user)):
    return await ChatService.answer(
        message=payload.message,
        user_id=user.id if user else None,
        product_id=payload.productId,
        history=payload.history,
    )


@legacy_router.post("/", response_model=ChatResponse)
async def chat(data: ChatRequest, user=Depends(get_optional_current_user)):
    response = await ChatService.answer(
        message=data.message,
        user_id=user.id if user else None,
        product_id=data.productId,
        history=data.history,
    )
    return {"message": response["answer"]}


router.include_router(chatbot_router)
router.include_router(legacy_router)
