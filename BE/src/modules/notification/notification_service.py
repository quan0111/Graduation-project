from src.core.database import prisma
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_manager import notification_manager
from fastapi import HTTPException


class NotificationService:

    @staticmethod
    async def create(data: NotificationCreate):

        notification = await prisma.notification.create(
            data={
                "title": data.title,
                "content": data.content,
                "type": data.type,
                "metadata": data.metadata,
                "isRead": False,

                # 🔥 RELATION CHUẨN
                "user": {
                    "connect": {"id": data.userId}
                }
            }
        )

        await notification_manager.send_notification(
            data.userId,
            {
                "id": notification.id,
                "title": notification.title,
                "content": notification.content,
                "type": notification.type
            }
        )

        return notification
    @staticmethod
    async def create_many(user_ids: list[int], data: NotificationCreate):

        # 🔥 create nhiều record 1 lần
        await prisma.notification.create_many(
            data=[
                {
                    "title": data.title,
                    "content": data.content,
                    "type": data.type,
                    "metadata": data.metadata,
                    "isRead": False,
                    "userId": user_id   # ⚠️ create_many KHÔNG dùng connect
                }
                for user_id in user_ids
            ]
        )

        for user_id in user_ids:
            await notification_manager.send_notification(
                user_id,
                {
                    "title": data.title,
                    "content": data.content,
                    "type": data.type
                }
            )

        return {"message": "Sent to multiple users"}
    @staticmethod
    async def get_notifications_by_user(user_id: int):

        return await prisma.notification.find_many(
            where={"userId": user_id},
            include={"user": True},
            order={"createdAt": "desc"}
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
            data={"isRead": True}
        )
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
            data={"isRead": True}
        )
    @staticmethod
    async def get_unread_notifications_count(user_id: int):

        return await prisma.notification.count(
            where={
                "userId": user_id,
                "isRead": False
            }
        )
    @staticmethod
    async def broadcast(data: NotificationCreate):

        await notification_manager.broadcast({
            "title": data.title,
            "content": data.content,
            "type": data.type
        })

        return {"message": "Broadcast sent"}