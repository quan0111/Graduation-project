from datetime import datetime, timedelta

from fastapi import HTTPException

from src.core.database import prisma


class FinanceService:
    MIN_COMMISSION_RATE = 0.03
    MAX_COMMISSION_RATE = 0.07
    COMMISSION_TIERS = [
        (5_000_000, 0.03),
        (2_000_000, 0.04),
        (1_000_000, 0.05),
        (500_000, 0.06),
        (0, 0.07),
    ]
    REVENUE_STATUSES = {"DELIVERED", "COMPLETED"}
    PAYOUT_READY_STATUSES = {"COMPLETED"}
    PENDING_REVENUE_STATUSES = {
        "PENDING",
        "CONFIRMED",
        "PAID",
        "PROCESSING",
        "READY_TO_SHIP",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
    }
    RETURN_STATUSES = {"RETURN_REQUESTED", "RETURNED"}
    CANCEL_STATUSES = {"CANCELLED", "CANCELLED_BY_CUSTOMER", "CANCELLED_BY_SELLER"}
    PAYOUT_LOCK_STATUSES = {"PENDING", "PROCESSING"}
    PAYOUT_DONE_STATUS = "PAID"

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
    def _is_shop_config_current(config, now: datetime):
        if not config or not getattr(config, "isActive", False):
            return False
        start_at = getattr(config, "startAt", None)
        end_at = getattr(config, "endAt", None)
        if start_at and start_at > now:
            return False
        if end_at and end_at < now:
            return False
        return True

    @staticmethod
    @staticmethod
    def _default_commission_rate_for_amount(amount: float) -> float:
        amount = max(float(amount or 0), 0)
        for minimum_amount, rate in FinanceService.COMMISSION_TIERS:
            if amount >= minimum_amount:
                return rate
        return FinanceService.MAX_COMMISSION_RATE

    @staticmethod
    def _normalize_commission_rate(rate: float) -> float:
        return min(max(float(rate), FinanceService.MIN_COMMISSION_RATE), FinanceService.MAX_COMMISSION_RATE)

    @staticmethod
    async def _get_commission_rate(shop_id: int | None = None, category_id: int | None = None, amount: float = 0) -> float:
        now = datetime.utcnow()

        if shop_id:
            shop_config = await prisma.shopcommissionconfig.find_unique(where={"shopId": shop_id})
            if FinanceService._is_shop_config_current(shop_config, now):
                return FinanceService._normalize_commission_rate(float(shop_config.commissionRate))

        if category_id:
            category_config = await prisma.categorycommissionconfig.find_unique(where={"categoryId": category_id})
            if category_config and category_config.isActive:
                return FinanceService._normalize_commission_rate(float(category_config.commissionRate))

        return FinanceService._default_commission_rate_for_amount(amount)

    @staticmethod
    def _item_amount(item) -> float:
        return float(item.price or 0) * int(item.quantity or 0)

    @staticmethod
    async def _commission_parts_for_item(item, basis_amount: float | None = None):
        amount = FinanceService._item_amount(item)
        category_id = getattr(getattr(item, "product", None), "categoryId", None)
        rate = await FinanceService._get_commission_rate(
            shop_id=getattr(item, "shopId", None),
            category_id=category_id,
            amount=basis_amount if basis_amount is not None else amount,
        )
        commission = amount * rate
        return {
            "grossAmount": amount,
            "commissionRate": rate,
            "commissionAmount": commission,
            "sellerNetAmount": max(amount - commission, 0),
        }

    @staticmethod
    async def _calculate_item_commission(items) -> tuple[float, float]:
        total = 0.0
        commission = 0.0
        order_shop_totals: dict[tuple[int | None, int | None], float] = {}

        for item in items:
            amount = FinanceService._item_amount(item)
            key = (getattr(item, "orderId", None), getattr(item, "shopId", None))
            order_shop_totals[key] = order_shop_totals.get(key, 0.0) + amount

        for item in items:
            amount = FinanceService._item_amount(item)
            total += amount
            category_id = getattr(getattr(item, "product", None), "categoryId", None)
            basis_amount = order_shop_totals.get((getattr(item, "orderId", None), getattr(item, "shopId", None)), amount)
            rate = await FinanceService._get_commission_rate(
                shop_id=getattr(item, "shopId", None),
                category_id=category_id,
                amount=basis_amount,
            )
            commission += amount * rate

        return total, commission

    @staticmethod
    async def calculate_commission(order_id: int):
        order = await prisma.order.find_unique(
            where={"id": order_id},
            include={"items": {"include": {"product": True}}},
        )
        if not order:
            raise HTTPException(404, "Order not found")

        total, commission = await FinanceService._calculate_item_commission(order.items)
        return {
            "orderId": order_id,
            "total": total,
            "commission": commission,
            "net": total - commission,
        }

    @staticmethod
    async def ensure_order_commissions(order_id: int):
        order = await prisma.order.find_unique(
            where={"id": order_id},
            include={"items": {"include": {"product": True}}, "packages": True},
        )
        if not order:
            raise HTTPException(404, "Order not found")

        order_status = FinanceService._to_value(order.status)
        has_shop_packages = bool(getattr(order, "packages", []) or [])
        if order_status in FinanceService.CANCEL_STATUSES and not has_shop_packages:
            await prisma.platformcommission.update_many(
                where={"orderId": order_id},
                data={"status": "CANCELLED", "note": f"Order #{order_id} was cancelled"},
            )
            return []

        if order_status in FinanceService.RETURN_STATUSES and not has_shop_packages:
            await prisma.platformcommission.update_many(
                where={"orderId": order_id},
                data={"status": "REFUNDED", "note": f"Order #{order_id} was returned"},
            )
            return []

        package_status_by_shop = {
            package.shopId: FinanceService._to_value(package.status)
            for package in getattr(order, "packages", []) or []
        }
        shop_gross_amounts: dict[int, float] = {}
        for item in order.items:
            if getattr(item, "deletedAt", None):
                continue
            shop_gross_amounts[item.shopId] = shop_gross_amounts.get(item.shopId, 0.0) + FinanceService._item_amount(item)

        records = []
        for item in order.items:
            if getattr(item, "deletedAt", None):
                continue
            item_status = package_status_by_shop.get(item.shopId, order_status)
            existing = await prisma.platformcommission.find_first(where={"orderItemId": item.id})
            if item_status in FinanceService.CANCEL_STATUSES:
                if existing:
                    await prisma.platformcommission.update(
                        where={"id": existing.id},
                        data={"status": "CANCELLED", "note": f"Order item #{item.id} was cancelled"},
                    )
                continue
            if item_status in FinanceService.RETURN_STATUSES:
                if existing:
                    await prisma.platformcommission.update(
                        where={"id": existing.id},
                        data={"status": "REFUNDED", "note": f"Order item #{item.id} was returned"},
                    )
                continue
            if item_status not in FinanceService.REVENUE_STATUSES:
                continue

            commission_status = "EARNED" if item_status in FinanceService.PAYOUT_READY_STATUSES else "PENDING"
            parts = await FinanceService._commission_parts_for_item(item, basis_amount=shop_gross_amounts.get(item.shopId))
            payload = {
                "order": {"connect": {"id": order_id}},
                "orderItem": {"connect": {"id": item.id}},
                "shop": {"connect": {"id": item.shopId}},
                **parts,
                "status": commission_status,
                "note": f"Auto calculated from order #{order_id}",
            }

            if existing:
                current_status = FinanceService._to_value(existing.status)
                next_status = current_status if current_status == "SETTLED" else commission_status
                record = await prisma.platformcommission.update(
                    where={"id": existing.id},
                    data={**parts, "status": next_status, "note": f"Auto recalculated from order #{order_id}"},
                    include={"shop": True, "order": True, "orderItem": True},
                )
            else:
                record = await prisma.platformcommission.create(
                    data=payload,
                    include={"shop": True, "order": True, "orderItem": True},
                )
            records.append(record)

        return records

    @staticmethod
    async def sync_commissions(days_back: int = 365):
        since = datetime.utcnow() - timedelta(days=max(1, min(days_back, 3650)))
        orders = await prisma.order.find_many(
            where={
                "status": {"in": sorted(FinanceService.REVENUE_STATUSES | FinanceService.RETURN_STATUSES | FinanceService.CANCEL_STATUSES)},
                "createdAt": {"gte": since},
                "deletedAt": None,
            },
            order={"createdAt": "desc"},
            take=1000,
        )

        synced_records = 0
        for order in orders:
            records = await FinanceService.ensure_order_commissions(order.id)
            synced_records += len(records)

        return {"orders": len(orders), "commissions": synced_records}

    @staticmethod
    async def get_commissions(status: str | None = None, shop_id: int | None = None, limit: int = 100):
        where = {}
        if status:
            where["status"] = status.upper()
        if shop_id:
            where["shopId"] = shop_id

        return await prisma.platformcommission.find_many(
            where=where,
            include={"shop": True, "order": True, "orderItem": True},
            order={"createdAt": "desc"},
            take=max(1, min(int(limit or 100), 500)),
        )

    @staticmethod
    def _sum_commissions(commissions, field: str, statuses: set[str] | None = None) -> float:
        total = 0.0
        for commission in commissions:
            status = FinanceService._to_value(commission.status)
            if statuses and status not in statuses:
                continue
            total += float(getattr(commission, field, 0) or 0)
        return total

    @staticmethod
    def _item_finance_status(item) -> str:
        order = getattr(item, "order", None)
        if not order:
            return ""
        packages = getattr(order, "packages", []) or []
        for package in packages:
            if package.shopId == item.shopId:
                return FinanceService._to_value(package.status)
        return FinanceService._to_value(order.status)

    @staticmethod
    async def get_admin_summary(sync: bool = True):
        if sync:
            await FinanceService.sync_commissions()

        commissions = await prisma.platformcommission.find_many()
        payouts = await prisma.sellerpayout.find_many()
        shops_count = await prisma.shop.count(where={"deletedAt": None})

        active_commission_statuses = {"PENDING", "EARNED", "SETTLED"}
        payout_ready_statuses = {"EARNED", "SETTLED"}
        pending_payout = sum(
            float(payout.amount or 0)
            for payout in payouts
            if FinanceService._to_value(payout.status) in FinanceService.PAYOUT_LOCK_STATUSES
        )
        paid_payout = sum(
            float(payout.amount or 0)
            for payout in payouts
            if FinanceService._to_value(payout.status) == FinanceService.PAYOUT_DONE_STATUS
        )
        failed_payout = sum(
            float(payout.amount or 0)
            for payout in payouts
            if FinanceService._to_value(payout.status) in {"FAILED", "CANCELLED"}
        )
        seller_net_available = FinanceService._sum_commissions(commissions, "sellerNetAmount", payout_ready_statuses)

        return {
            "grossRevenue": FinanceService._sum_commissions(commissions, "grossAmount", active_commission_statuses),
            "commissionAmount": FinanceService._sum_commissions(commissions, "commissionAmount", active_commission_statuses),
            "sellerNetAmount": seller_net_available,
            "availableBalance": max(seller_net_available - pending_payout - paid_payout, 0),
            "pendingPayoutAmount": pending_payout,
            "paidPayoutAmount": paid_payout,
            "failedPayoutAmount": failed_payout,
            "pendingPayoutCount": sum(1 for payout in payouts if FinanceService._to_value(payout.status) == "PENDING"),
            "payoutCount": len(payouts),
            "commissionCount": len(commissions),
            "shopsCount": shops_count,
        }

    @staticmethod
    def _assert_valid_commission_rate(rate: float):
        if rate < FinanceService.MIN_COMMISSION_RATE or rate > FinanceService.MAX_COMMISSION_RATE:
            raise HTTPException(400, "Commission rate must be between 3% and 7%")

    @staticmethod
    async def get_shop_commission_configs():
        return await prisma.shopcommissionconfig.find_many(include={"shop": True}, order={"updatedAt": "desc"})

    @staticmethod
    async def upsert_shop_commission_config(data):
        FinanceService._assert_valid_commission_rate(float(data.commissionRate))

        shop = await prisma.shop.find_unique(where={"id": data.shopId})
        if not shop:
            raise HTTPException(404, "Shop not found")

        existing = await prisma.shopcommissionconfig.find_unique(where={"shopId": data.shopId})
        payload = {
            "commissionRate": FinanceService._normalize_commission_rate(float(data.commissionRate)),
            "isActive": bool(data.isActive),
            "startAt": data.startAt,
            "endAt": data.endAt,
        }

        if existing:
            return await prisma.shopcommissionconfig.update(
                where={"shopId": data.shopId},
                data=payload,
                include={"shop": True},
            )

        return await prisma.shopcommissionconfig.create(
            data={**payload, "shop": {"connect": {"id": data.shopId}}},
            include={"shop": True},
        )

    @staticmethod
    async def get_category_commission_configs():
        return await prisma.categorycommissionconfig.find_many(include={"category": True}, order={"updatedAt": "desc"})

    @staticmethod
    async def upsert_category_commission_config(data):
        FinanceService._assert_valid_commission_rate(float(data.commissionRate))

        category = await prisma.category.find_unique(where={"id": data.categoryId})
        if not category:
            raise HTTPException(404, "Category not found")

        existing = await prisma.categorycommissionconfig.find_unique(where={"categoryId": data.categoryId})
        payload = {
            "commissionRate": FinanceService._normalize_commission_rate(float(data.commissionRate)),
            "isActive": bool(data.isActive),
        }

        if existing:
            return await prisma.categorycommissionconfig.update(
                where={"categoryId": data.categoryId},
                data=payload,
                include={"category": True},
            )

        return await prisma.categorycommissionconfig.create(
            data={**payload, "category": {"connect": {"id": data.categoryId}}},
            include={"category": True},
        )

    @staticmethod
    async def create_payout(data):
        shop = await prisma.shop.find_unique(where={"id": data.shopId})
        if not shop:
            raise HTTPException(404, "Shop not found")

        wallet = await FinanceService.get_shop_wallet(data.shopId)
        amount = float(data.amount or 0)
        if amount <= 0:
            raise HTTPException(400, "Payout amount must be greater than 0")
        if amount > float(wallet["availableBalance"] or 0):
            raise HTTPException(400, "Payout amount exceeds available balance")

        return await prisma.sellerpayout.create(
            data={"amount": amount, "status": "PENDING", "shop": {"connect": {"id": data.shopId}}},
            include={"shop": True, "reviewedBy": True},
        )

    @staticmethod
    async def update_payout(payout_id: int, data, reviewed_by_id: int | None = None):
        payout = await prisma.sellerpayout.find_unique(where={"id": payout_id}, include={"shop": True})
        if not payout:
            raise HTTPException(404, "Payout not found")

        next_status = str(data.status or "").upper()
        if next_status not in {"PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"}:
            raise HTTPException(400, "Invalid payout status")

        current_status = FinanceService._to_value(payout.status)
        if current_status in {"PAID", "FAILED", "CANCELLED"} and next_status != current_status:
            raise HTTPException(400, "Finalized payout cannot be changed")

        amount = float(payout.amount or 0)
        if next_status in {"PROCESSING", "PAID"}:
            wallet = await FinanceService.get_shop_wallet(payout.shopId)
            available_with_current_request = float(wallet["availableBalance"] or 0)
            if current_status in FinanceService.PAYOUT_LOCK_STATUSES:
                available_with_current_request += amount
            if amount > available_with_current_request:
                raise HTTPException(400, "Payout amount exceeds available balance")

        update_data = {
            "status": next_status,
            "note": getattr(data, "note", None),
            "paidAt": datetime.utcnow() if next_status == "PAID" else None,
        }
        if next_status != "PENDING":
            update_data["reviewedAt"] = datetime.utcnow()
            if reviewed_by_id:
                update_data["reviewedBy"] = {"connect": {"id": reviewed_by_id}}
        if next_status == current_status and getattr(data, "note", None) is None:
            update_data.pop("note", None)

        return await prisma.sellerpayout.update(
            where={"id": payout_id},
            data=update_data,
            include={"shop": True, "reviewedBy": True},
        )

    @staticmethod
    async def get_payout(payout_id: int):
        payout = await prisma.sellerpayout.find_unique(where={"id": payout_id}, include={"shop": True, "reviewedBy": True})
        if not payout:
            raise HTTPException(404, "Payout not found")
        return payout

    @staticmethod
    async def get_payouts_by_shop(shop_id: int):
        return await prisma.sellerpayout.find_many(
            where={"shopId": shop_id},
            include={"shop": True, "reviewedBy": True},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_all_payouts(status: str | None = None):
        where = {}
        if status:
            where["status"] = status.upper()
        return await prisma.sellerpayout.find_many(where=where, include={"shop": True, "reviewedBy": True}, order={"createdAt": "desc"})

    @staticmethod
    async def get_shop_revenue(shop_id: int):
        items = await prisma.orderitem.find_many(
            where={"shopId": shop_id, "order": {"status": {"in": sorted(FinanceService.REVENUE_STATUSES)}}},
            include={"order": {"include": {"packages": True}}, "product": True},
        )
        ready_items = [item for item in items if FinanceService._item_finance_status(item) in FinanceService.PAYOUT_READY_STATUSES]
        total_revenue, commission = await FinanceService._calculate_item_commission(ready_items)

        return {
            "shopId": shop_id,
            "revenue": total_revenue,
            "commission": commission,
            "net": total_revenue - commission,
        }

    @staticmethod
    async def get_seller_wallet(user_id: int):
        shop = await FinanceService._get_seller_shop(user_id)
        return await FinanceService.get_shop_wallet(shop.id)

    @staticmethod
    async def get_shop_wallet(shop_id: int):
        await FinanceService.sync_shop_commissions(shop_id)
        items = await prisma.orderitem.find_many(
            where={"shopId": shop_id, "deletedAt": None},
            include={"order": {"include": {"packages": True}}, "product": True},
        )
        payouts = await prisma.sellerpayout.find_many(
            where={"shopId": shop_id},
            include={"reviewedBy": True},
            order={"createdAt": "desc"},
            take=20,
        )

        gross_revenue = 0.0
        completed_revenue = 0.0
        pending_revenue = 0.0
        refunded_revenue = 0.0
        cancelled_revenue = 0.0
        completed_items = []

        for item in items:
            amount = float(item.price or 0) * int(item.quantity or 0)
            status = FinanceService._item_finance_status(item)
            if status in FinanceService.PAYOUT_READY_STATUSES:
                gross_revenue += amount
                completed_revenue += amount
                completed_items.append(item)
            elif status in FinanceService.PENDING_REVENUE_STATUSES:
                pending_revenue += amount
            elif status in FinanceService.RETURN_STATUSES:
                refunded_revenue += amount
            elif status in FinanceService.CANCEL_STATUSES:
                cancelled_revenue += amount

        _, commission = await FinanceService._calculate_item_commission(completed_items)
        available = max(completed_revenue - commission, 0)
        pending_payout = sum(float(p.amount or 0) for p in payouts if FinanceService._to_value(p.status) in FinanceService.PAYOUT_LOCK_STATUSES)
        paid_payout = sum(float(p.amount or 0) for p in payouts if FinanceService._to_value(p.status) == FinanceService.PAYOUT_DONE_STATUS)

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
    async def sync_shop_commissions(shop_id: int):
        order_items = await prisma.orderitem.find_many(
            where={
                "shopId": shop_id,
                "deletedAt": None,
                "order": {"status": {"in": sorted(FinanceService.REVENUE_STATUSES | FinanceService.RETURN_STATUSES | FinanceService.CANCEL_STATUSES)}},
            },
            include={"order": True},
            take=500,
        )
        order_ids = sorted({item.orderId for item in order_items if item.orderId})
        for order_id in order_ids:
            await FinanceService.ensure_order_commissions(order_id)
        return {"orders": len(order_ids)}

    @staticmethod
    async def get_seller_report(user_id: int, days: int = 30):
        shop = await FinanceService._get_seller_shop(user_id)
        since = datetime.utcnow() - timedelta(days=max(1, min(days, 365)))
        items = await prisma.orderitem.find_many(
            where={"shopId": shop.id, "deletedAt": None, "createdAt": {"gte": since}},
            include={"order": {"include": {"packages": True}}, "product": True},
        )

        daily: dict[str, dict] = {}
        top_products: dict[int, dict] = {}
        order_ids = set()
        cancelled_order_ids = set()
        returned_order_ids = set()
        payment_hold_statuses = {"PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}

        for item in items:
            if not item.order:
                continue
            status = FinanceService._item_finance_status(item)
            if status in payment_hold_statuses:
                continue
            order_ids.add(item.orderId)
            if status in FinanceService.CANCEL_STATUSES:
                cancelled_order_ids.add(item.orderId)
            if status in FinanceService.RETURN_STATUSES:
                returned_order_ids.add(item.orderId)

            day = item.order.createdAt.date().isoformat()
            amount = float(item.price or 0) * int(item.quantity or 0)
            daily.setdefault(day, {"date": day, "revenue": 0.0, "orders": set(), "cancelled": 0, "returned": 0})
            if status in FinanceService.PAYOUT_READY_STATUSES:
                daily[day]["revenue"] += amount
            daily[day]["orders"].add(item.orderId)
            if status in FinanceService.CANCEL_STATUSES:
                daily[day]["cancelled"] += 1
            if status in FinanceService.RETURN_STATUSES:
                daily[day]["returned"] += 1

            if status in FinanceService.PAYOUT_READY_STATUSES:
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

        daily_revenue = [{**value, "orders": len(value["orders"])} for value in sorted(daily.values(), key=lambda item: item["date"])]
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
