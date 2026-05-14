from datetime import datetime, timedelta

from fastapi import HTTPException
from src.core.database import prisma


class FinanceService:
    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    async def _get_seller_shop(user_id: int):
        shop = await prisma.shop.find_first(where={"ownerId": user_id, "deletedAt": None})
        if not shop:
            raise HTTPException(404, "Shop not found")
        return shop

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

    @staticmethod
    async def get_seller_wallet(user_id: int):
        shop = await FinanceService._get_seller_shop(user_id)
        return await FinanceService.get_shop_wallet(shop.id)

    @staticmethod
    async def get_shop_wallet(shop_id: int):
        items = await prisma.orderitem.find_many(
            where={"shopId": shop_id, "deletedAt": None},
            include={"order": True},
        )
        payouts = await prisma.sellerpayout.find_many(
            where={"shopId": shop_id},
            order={"createdAt": "desc"},
            take=20,
        )

        completed_statuses = {"DELIVERED", "COMPLETED"}
        pending_statuses = {"PENDING", "CONFIRMED", "PAID", "PROCESSING", "READY_TO_SHIP", "SHIPPED", "IN_TRANSIT"}
        refunded_statuses = {"RETURN_REQUESTED", "RETURNED"}

        gross_revenue = 0.0
        completed_revenue = 0.0
        pending_revenue = 0.0
        refunded_revenue = 0.0
        cancelled_revenue = 0.0

        for item in items:
            amount = float(item.price or 0) * int(item.quantity or 0)
            gross_revenue += amount
            status = FinanceService._to_value(item.order.status) if item.order else ""
            if status in completed_statuses:
                completed_revenue += amount
            elif status in pending_statuses:
                pending_revenue += amount
            elif status in refunded_statuses:
                refunded_revenue += amount
            elif status == "CANCELLED":
                cancelled_revenue += amount

        commission_rate = 0.1
        commission = completed_revenue * commission_rate
        available = max(completed_revenue - commission - refunded_revenue, 0)
        pending_payout = sum(float(p.amount or 0) for p in payouts if FinanceService._to_value(p.status) in {"PENDING", "PROCESSING"})
        paid_payout = sum(float(p.amount or 0) for p in payouts if FinanceService._to_value(p.status) == "PAID")

        return {
            "shopId": shop_id,
            "grossRevenue": gross_revenue,
            "completedRevenue": completed_revenue,
            "pendingRevenue": pending_revenue,
            "refundedRevenue": refunded_revenue,
            "cancelledRevenue": cancelled_revenue,
            "commission": commission,
            "availableBalance": max(available - pending_payout - paid_payout, 0),
            "pendingPayout": pending_payout,
            "paidPayout": paid_payout,
            "payouts": payouts,
        }

    @staticmethod
    async def get_seller_report(user_id: int, days: int = 30):
        shop = await FinanceService._get_seller_shop(user_id)
        since = datetime.utcnow() - timedelta(days=max(1, min(days, 365)))
        items = await prisma.orderitem.find_many(
            where={
                "shopId": shop.id,
                "deletedAt": None,
                "createdAt": {"gte": since},
            },
            include={"order": True, "product": True},
        )

        daily: dict[str, dict] = {}
        top_products: dict[int, dict] = {}
        order_ids = set()
        cancelled_order_ids = set()
        returned_order_ids = set()

        for item in items:
            if not item.order:
                continue
            order_ids.add(item.orderId)
            status = FinanceService._to_value(item.order.status)
            if status == "CANCELLED":
                cancelled_order_ids.add(item.orderId)
            if status in {"RETURN_REQUESTED", "RETURNED"}:
                returned_order_ids.add(item.orderId)

            day = item.order.createdAt.date().isoformat()
            amount = float(item.price or 0) * int(item.quantity or 0)
            daily.setdefault(day, {"date": day, "revenue": 0.0, "orders": set(), "cancelled": 0, "returned": 0})
            daily[day]["revenue"] += 0 if status == "CANCELLED" else amount
            daily[day]["orders"].add(item.orderId)
            if status == "CANCELLED":
                daily[day]["cancelled"] += 1
            if status in {"RETURN_REQUESTED", "RETURNED"}:
                daily[day]["returned"] += 1

            top_products.setdefault(
                item.productId,
                {
                    "productId": item.productId,
                    "name": item.productName,
                    "sold": 0,
                    "revenue": 0.0,
                    "image": item.productImage,
                },
            )
            top_products[item.productId]["sold"] += int(item.quantity or 0)
            top_products[item.productId]["revenue"] += amount

        daily_revenue = [
            {
                **value,
                "orders": len(value["orders"]),
            }
            for value in sorted(daily.values(), key=lambda item: item["date"])
        ]
        total_orders = len(order_ids)

        return {
            "shopId": shop.id,
            "shopName": shop.name,
            "days": days,
            "dailyRevenue": daily_revenue,
            "topProducts": sorted(top_products.values(), key=lambda item: item["revenue"], reverse=True)[:10],
            "returnRate": round((len(returned_order_ids) / total_orders) * 100, 2) if total_orders else 0,
            "cancelRate": round((len(cancelled_order_ids) / total_orders) * 100, 2) if total_orders else 0,
            "totalOrders": total_orders,
        }
