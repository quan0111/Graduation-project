from src.core.database import prisma
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_manager import NotificationManager

class NotificationService:
    @staticmethod
    async def create_notifications(notification_data: NotificationCreate):
        new_notification = await prisma.notification.create(data=notification_data.dict())
        manager = NotificationManager()
        await manager.send_notification(notification_data.userId, new_notification)
        return new_notification
    @staticmethod
    async def get_notifications_by_user(user_id: int):
        notifications = await prisma.notification.find_many(where={"userId": user_id})
        return notifications
    @staticmethod
    async def mark_notification_as_read(notification_id: int):
        updated_notification = await prisma.notification.update(
            where={"id": notification_id},
            data={"isRead": True}
        )
        return updated_notification
    @staticmethod
    async def delete_notification(notification_id: int):
        await prisma.notification.delete(where={"id": notification_id})
    @staticmethod
    async def delete_all_notifications_for_user(user_id: int):
        await prisma.notification.delete_many(where={"userId": user_id})
    @staticmethod
    async def mark_all_notifications_as_read_for_user(user_id: int):
        await prisma.notification.update_many(
            where={"userId": user_id},
            data={"isRead": True}
        )
    @staticmethod
    async def get_unread_notifications_count(user_id: int):
        count = await prisma.notification.count(where={"userId": user_id, "isRead": False})
        return count