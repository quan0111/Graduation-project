from fastapi import APIRouter, WebSocket, Depends
from src.modules.notification.notification_service import NotificationService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_websocket import notification_ws
from src.core.dependencies import get_current_user
from src.core.security import decode_token

router = APIRouter(prefix="/notifications", tags=["Notifications"])
service = NotificationService()

@router.post("/")
async def create_notification(
    data: NotificationCreate,
    current_user=Depends(get_current_user)
):
    data.userId = current_user.id
    return await service.create(data)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # 🔥 decode token để lấy user_id
    user_id = decode_token(token)["sub"]
    await notification_ws(websocket, int(user_id))


@router.get("/")
async def get_notifications(current_user=Depends(get_current_user)):
    return await service.get_notifications_by_user(current_user.id)