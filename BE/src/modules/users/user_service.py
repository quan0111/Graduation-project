from datetime import datetime
from fastapi import HTTPException
from src.core.database import prisma
from src.modules.users.user_schema import UserCreate, UserProfileUpdate, UserUpdate
from src.core.security import hash_password
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService


class UserService:

    @staticmethod
    def _serialize_profile(user):
        return {
            "id": user.id,
            "email": user.email,
            "fullName": user.fullName,
            "phone": user.phone,
            "avatarUrl": user.avatarUrl,
            "role": user.role,
            "isActive": user.isActive,
            "createdAt": user.createdAt,
            "updatedAt": user.updatedAt,
        }

    @staticmethod
    async def create_user(user_data: UserCreate):
        existing = await prisma.user.find_unique(
            where={"email": user_data.email}
        )
        if existing:
            raise HTTPException(400, "Email already exists")

        hashed_password = hash_password(user_data.password)

        data = user_data.dict()
        data["password"] = hashed_password

        new_user = await prisma.user.create(
            data={
                **data,
                "carts": {
                    "create": {}
                }
            }
        )

        return new_user

    @staticmethod
    async def get_all_users():
        return await prisma.user.find_many(
            where={"deletedAt": None},
            include={
                "addresses": True,
                "carts": True
            }
        )

    @staticmethod
    async def get_user(user_id: int):
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={
                "addresses": True,
                "carts": True,
                "orders": True
            }
        )

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        return user

    @staticmethod
    async def update_user(user_id: int, user_data: UserUpdate):
        existing = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        data = user_data.dict(exclude_unset=True)

        if "password" in data and data["password"]:
            data["password"] = hash_password(data["password"])
        elif "password" in data:
            del data["password"]

        updated_user = await prisma.user.update(
            where={"id": user_id},
            data=data,
            include={
                "addresses": True,
                "carts": True,
                "orders": True
            }
        )

        return updated_user

    @staticmethod
    async def ban_user(user_id: int, reason: str, admin_id: int | None = None):
        """
        Ban user: vô hiệu hoá tài khoản + ban toàn bộ shop của họ
        + gửi notification cho user
        """
        user = await prisma.user.find_unique(
            where={"id": user_id},
            include={"shops": True},
        )

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if not user.isActive:
            raise HTTPException(400, "Tài khoản đã bị khóa từ trước")

        # 1. Ban user
        await prisma.user.update(
            where={"id": user_id},
            data={"isActive": False},
        )

        # 2. Ban toàn bộ shop của user đó
        shop_ids = []
        if user.shops:
            shop_ids = [user.shops.id]
            await prisma.shop.update_many(
                where={"ownerId": user_id},
                data={"isActive": False},
            )

        # 3. Gửi notification cho user
        await NotificationService.create(
            NotificationCreate(
                userId=user_id,
                title=" Tài khoản của bạn đã bị khóa",
                content=(
                    f"Tài khoản của bạn đã bị Admin khóa với lý do: {reason}. "
                    "Vui lòng liên hệ bộ phận hỗ trợ để được giải quyết."
                ),
                type="SYSTEM",
                metadata={
                    "reason": reason,
                    "bannedShopIds": shop_ids,
                },
            )
        )

        await AuditService.create(
            actor_id=admin_id,
            action="USER.LOCKED",
            entity_type="User",
            entity_id=user_id,
            target_user_id=user_id,
            severity="WARNING",
            metadata={"reason": reason, "bannedShopIds": shop_ids},
        )

        return {
            "message": "User và shop liên quan đã bị khóa",
            "userId": user_id,
            "bannedShops": shop_ids,
        }

    @staticmethod
    async def unban_user(user_id: int, admin_id: int | None = None):
        """Mở khóa tài khoản user (không tự động mở shop)"""
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        if user.isActive:
            raise HTTPException(400, "Tài khoản chưa bị khóa")

        await prisma.user.update(
            where={"id": user_id},
            data={"isActive": True},
        )

        # Gửi notification thông báo mở khóa
        await NotificationService.create(
            NotificationCreate(
                userId=user_id,
                title="✅ Tài khoản của bạn đã được mở khóa",
                content="Tài khoản của bạn đã được Admin khôi phục. Bạn có thể đăng nhập bình thường.",
                type="SYSTEM",
                metadata={"unbanned": True},
            )
        )

        await AuditService.create(
            actor_id=admin_id,
            action="USER.UNLOCKED",
            entity_type="User",
            entity_id=user_id,
            target_user_id=user_id,
            severity="INFO",
            metadata={"unbanned": True},
        )

        return {"message": "Tài khoản đã được mở khóa", "userId": user_id}

    @staticmethod
    async def delete_user(user_id: int):
        existing = await prisma.user.find_unique(
            where={"id": user_id}
        )

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        await prisma.refreshtoken.update_many(
            where={"userId": user_id, "isRevoked": False},
            data={"isRevoked": True},
        )

        return await prisma.user.update(
            where={"id": user_id},
            data={"deletedAt": datetime.utcnow()}
        )

    @staticmethod
    async def get_current_user_profile(user_id: int):
        user = await prisma.user.find_unique(where={"id": user_id})

        if not user or user.deletedAt:
            raise HTTPException(404, "User not found")

        return UserService._serialize_profile(user)

    @staticmethod
    async def update_current_user_profile(user_id: int, user_data: UserProfileUpdate):
        existing = await prisma.user.find_unique(where={"id": user_id})

        if not existing or existing.deletedAt:
            raise HTTPException(404, "User not found")

        data = user_data.dict(exclude_unset=True)
        email = data.get("email")

        if email and email != existing.email:
            duplicate = await prisma.user.find_first(
                where={
                    "email": email,
                    "NOT": {"id": user_id},
                }
            )
            if duplicate:
                raise HTTPException(400, "Email already exists")

        updated_user = await prisma.user.update(
            where={"id": user_id},
            data=data,
        )

        return UserService._serialize_profile(updated_user)
