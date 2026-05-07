from fastapi import HTTPException
from src.core.database import prisma


class FinanceService:

    @staticmethod
    async def calculate_commission(order_id: int):

        order = await prisma.order.find_unique(
            where={"id": order_id},
            include={
                "items": True,
            }
        )

        if not order:
            raise HTTPException(404, "Order not found")

        total = sum(item.price * item.quantity for item in order.items)

        # 🔥 lấy commission config (fallback 10%)
        commission_rate = 0.1

        commission = total * commission_rate
        net = total - commission

        return {
            "orderId": order_id,
            "total": total,
            "commission": commission,
            "net": net
        }
    @staticmethod
    async def create_payout(data):

        # ❗ check shop tồn tại
        shop = await prisma.shop.find_unique(
            where={"id": data.shopId}
        )
        if not shop:
            raise HTTPException(404, "Shop not found")

        return await prisma.sellerpayout.create(
            data={
                "amount": data.amount,
                "status": "PENDING",

                # 🔥 RELATION
                "shop": {
                    "connect": {"id": data.shopId}
                }
            }
        )

    @staticmethod
    async def update_payout(payout_id: int, data):

        payout = await prisma.sellerpayout.find_unique(
            where={"id": payout_id}
        )
        if not payout:
            raise HTTPException(404, "Payout not found")

        return await prisma.sellerpayout.update(
            where={"id": payout_id},
            data={
                "status": data.status
            }
        )

    @staticmethod
    async def get_payout(payout_id: int):

        payout = await prisma.sellerpayout.find_unique(
            where={"id": payout_id},
            include={
                "shop": True
            }
        )

        if not payout:
            raise HTTPException(404, "Payout not found")

        return payout
    @staticmethod
    async def get_payouts_by_shop(shop_id: int):

        return await prisma.sellerpayout.find_many(
            where={"shopId": shop_id},
            include={"shop": True},
            order={"createdAt": "desc"}
        )

    @staticmethod
    async def get_shop_revenue(shop_id: int):

        items = await prisma.orderitem.find_many(
            where={
                "shopId": shop_id,
                "order": {
                    "status": {"in": ["DELIVERED", "COMPLETED"]},
                },
            },
            include={"order": True}
        )

        total_revenue = sum(item.price * item.quantity for item in items)

        commission = total_revenue * 0.1
        net = total_revenue - commission

        return {
            "shopId": shop_id,
            "revenue": total_revenue,
            "commission": commission,
            "net": net
        }
