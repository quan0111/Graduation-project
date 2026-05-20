from fastapi import APIRouter, WebSocket, Depends, HTTPException
from src.core.database import prisma
from src.modules.notification.notification_service import NotificationService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_websocket import notification_ws
from src.core.dependencies import get_current_user
from src.core.security import decode_token, verify_token_type

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
    payload = decode_token(token)
    if not verify_token_type(payload, "access"):
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008)
        return

    user = await prisma.user.find_first(
        where={"id": int(user_id), "isActive": True, "deletedAt": None}
    )
    if not user:
        await websocket.close(code=1008)
        return
    await notification_ws(websocket, int(user_id))


@router.get("/")
async def get_notifications(type: str | None = None, current_user=Depends(get_current_user)):
    return await service.get_notifications_by_user_and_type(current_user.id, type)


@router.get("/unread/count")
async def get_unread_count(current_user=Depends(get_current_user)):
    return {"count": await service.get_unread_notifications_count(current_user.id)}


@router.patch("/{notification_id}/read")
async def mark_read(notification_id: int, current_user=Depends(get_current_user)):
    existing = await service.get_notification(notification_id)
    if existing.userId != current_user.id:
        raise HTTPException(403, "Forbidden")
    notification = await service.mark_notification_as_read(notification_id)
    return notification


@router.patch("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    await service.mark_all_notifications_as_read_for_user(current_user.id)
    return {"message": "All notifications marked as read"}


@router.delete("/{notification_id}")
async def delete_notification(notification_id: int, current_user=Depends(get_current_user)):
    notification = await service.get_notification(notification_id)
    if notification.userId != current_user.id:
        raise HTTPException(403, "Forbidden")
    await service.delete_notification(notification_id)
    return {"message": "Notification deleted"}
