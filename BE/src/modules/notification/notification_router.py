from fastapi import APIRouter, WebSocket
from src.modules.notification.notification_websocket import notification_ws
from src.modules.notification.notification_service import NotificationService
from src.modules.notification.notification_schema import NotificationCreate

router = APIRouter(prefix="/notifications", tags=["Notifications"])
service = NotificationService()


@router.post("/")
async def create_notification(data: NotificationCreate):
    return await service.create(data)


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await notification_ws(websocket, user_id)

@router.get("/user/{user_id}")
async def get_notifications_by_user(user_id: int):
    return await service.get_notifications_by_user(user_id)
@router.patch("/{notification_id}/read")
async def mark_notification_as_read(notification_id: int):
    return await service.mark_notification_as_read(notification_id)
@router.delete("/{notification_id}")
async def delete_notification(notification_id: int):
    await service.delete_notification(notification_id)
    return {"message": "Notification deleted successfully"}
@router.delete("/user/{user_id}")
async def delete_all_notifications_for_user(user_id: int):
    await service.delete_all_notifications_for_user(user_id)
    return {"message": "All notifications for user deleted successfully"}
@router.patch("/user/{user_id}/read")
async def mark_all_notifications_as_read_for_user(user_id: int):
    await service.mark_all_notifications_as_read_for_user(user_id)
    return {"message": "All notifications for user marked as read successfully"}
@router.get("/user/{user_id}/unread_count")
async def get_unread_notifications_count(user_id: int):
    count = await service.get_unread_notifications_count(user_id)
    return {"unread_count": count}