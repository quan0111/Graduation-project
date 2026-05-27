from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.modules.notification.notification_manager import notification_manager
from src.modules.notification.notification_schema import NotificationCreate


class NotificationService:
    @staticmethod
    def _type_value(value):
        return value.value if hasattr(value, "value") else value

    @staticmethod
    def _json_safe(value):
        if hasattr(value, "model_dump"):
            return value.model_dump()
        if isinstance(value, dict):
            return {str(key): NotificationService._json_safe(item) for key, item in value.items()}
        if isinstance(value, (list, tuple, set)):
            return [NotificationService._json_safe(item) for item in value]
        if hasattr(value, "value"):
            return value.value
        return value

    @staticmethod
    def _create_payload(data: NotificationCreate, user_id: int | None = None):
        recipient_id = user_id if user_id is not None else data.userId
        if recipient_id is None:
            raise HTTPException(400, "Notification recipient userId is required")

        payload = {
            "userId": int(recipient_id),
            "title": data.title,
            "content": data.content,
            "type": NotificationService._type_value(data.type),
            "isRead": False,
        }
        if data.metadata is not None:
            payload["metadata"] = Json(NotificationService._json_safe(data.metadata))
        return payload

    @staticmethod
    def _event_payload(notification=None, data: NotificationCreate | None = None):
        if notification is not None:
            return {
                "id": notification.id,
                "title": notification.title,
                "content": notification.content,
                "type": NotificationService._type_value(notification.type),
                "metadata": notification.metadata,
                "createdAt": notification.createdAt.isoformat() if notification.createdAt else None,
            }
        if data is None:
            return {}
        return {
            "title": data.title,
            "content": data.content,
            "type": NotificationService._type_value(data.type),
            "metadata": data.metadata,
        }

    @staticmethod
    async def create(data: NotificationCreate):
        notification = await prisma.notification.create(
            data=NotificationService._create_payload(data)
        )

        await notification_manager.send_notification(
            data.userId,
            NotificationService._event_payload(notification=notification),
        )

        return notification

    @staticmethod
    async def create_many(user_ids: list[int], data: NotificationCreate):
        clean_user_ids = [int(user_id) for user_id in user_ids if user_id is not None]
        if not clean_user_ids:
            return {"message": "No notification recipients"}

        for user_id in clean_user_ids:
            await prisma.notification.create(
                data=NotificationService._create_payload(data, user_id=user_id)
            )
            await notification_manager.send_notification(
                user_id,
                NotificationService._event_payload(data=data),
            )

        return {"message": "Sent to multiple users"}

    @staticmethod
    async def get_notifications_by_user(user_id: int):
        return await prisma.notification.find_many(
            where={"userId": user_id},
            include={"user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_notifications_by_user_and_type(user_id: int, notification_type: str | None = None):
        where = {"userId": user_id}
        if notification_type:
            where["type"] = notification_type
        return await prisma.notification.find_many(
            where=where,
            include={"user": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def mark_notification_as_read(notification_id: int):
        notification = await prisma.notification.find_unique(
            where={"id": notification_id}
        )

        if not notification:
            raise HTTPException(404, "Notification not found")

        return await prisma.notification.update(
            where={"id": notification_id},
            data={"isRead": True},
        )

    @staticmethod
    async def get_notification(notification_id: int):
        notification = await prisma.notification.find_unique(where={"id": notification_id})
        if not notification:
            raise HTTPException(404, "Notification not found")
        return notification

    @staticmethod
    async def delete_notification(notification_id: int):
        notification = await prisma.notification.find_unique(
            where={"id": notification_id}
        )

        if not notification:
            raise HTTPException(404, "Notification not found")

        await prisma.notification.delete(where={"id": notification_id})

    @staticmethod
    async def delete_all_notifications_for_user(user_id: int):
        await prisma.notification.delete_many(
            where={"userId": user_id}
        )

    @staticmethod
    async def mark_all_notifications_as_read_for_user(user_id: int):
        await prisma.notification.update_many(
            where={"userId": user_id},
            data={"isRead": True},
        )

    @staticmethod
    async def get_unread_notifications_count(user_id: int):
        return await prisma.notification.count(
            where={
                "userId": user_id,
                "isRead": False,
            }
        )

    @staticmethod
    async def broadcast(data: NotificationCreate):
        await notification_manager.broadcast({
            "title": data.title,
            "content": data.content,
            "type": data.type,
        })

        return {"message": "Broadcast sent"}
