from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.inventory.inventory_service import InventoryService
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService
from src.modules.order.momo_service import MoMoService
from src.modules.order.order_schema import PaymentCreate, PaymentGatewayCreate, PaymentGatewayOut, PaymentOut
from src.modules.order.vnpay_service import VNPayService


PAYMENT_STATUS_ALIASES = {
    "PENDING_PAYMENT": "PENDING",
    "PAYMENT_SUCCESS": "SUCCESS",
    "PAYMENT_FAILED": "FAILED",
}
PAYMENT_SUCCESS_STATUSES = {"SUCCESS", "PAYMENT_SUCCESS"}
PAYMENT_FAILED_STATUSES = {"FAILED", "PAYMENT_FAILED"}
PAYMENT_PENDING_STATUSES = {"PENDING", "PENDING_PAYMENT"}
MOMO_PENDING_RESULT_CODES = {"1000", "7000", "7002", "9000"}
ORDER_PAYMENT_HOLD_STATUSES = {"PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}


class PaymentService:
    GATEWAY_METHODS = {"MOMO", "VNPAY"}

    @staticmethod
    def _normalize_status(status: str) -> str:
        normalized = status.upper()
        return PAYMENT_STATUS_ALIASES.get(normalized, normalized)

    @staticmethod
    async def create_payment(payment_data: PaymentCreate, current_user) -> PaymentOut:
        order = await prisma.order.find_unique(where={"id": payment_data.orderId})
        if not order:
            raise HTTPException(404, "Order not found")
        if order.userId != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")

        existing = await prisma.payment.find_unique(where={"orderId": payment_data.orderId})
        if existing:
            raise HTTPException(400, "Payment already exists for this order")

        payment = await prisma.payment.create(
            data={
                "order": {"connect": {"id": payment_data.orderId}},
                "method": payment_data.method,
                "status": "PENDING",
                "amount": float(order.totalAmount or 0),
            }
        )

        return PaymentService._to_out(payment)

    @staticmethod
    async def create_gateway_payment(payment_data: PaymentGatewayCreate, current_user, ip_address: str) -> PaymentGatewayOut:
        method = payment_data.method.upper()
        if method not in PaymentService.GATEWAY_METHODS:
            raise HTTPException(400, "Payment method must be MOMO or VNPAY")

        order = await prisma.order.find_unique(
            where={"id": payment_data.orderId},
            include={"payment": True},
        )
        if not order:
            raise HTTPException(404, "Order not found")
        if order.userId != current_user.id:
            raise HTTPException(403, "Forbidden")

        amount = int(round(float(order.totalAmount or 0)))
        if amount <= 0:
            raise HTTPException(400, "Order total amount must be greater than 0")

        existing = await prisma.payment.find_unique(where={"orderId": order.id})
        if existing and PaymentService._to_value(existing.status) in PAYMENT_SUCCESS_STATUSES:
            raise HTTPException(400, "Order is already paid")

        if method == "VNPAY":
            gateway_data = VNPayService.create_payment_url(order.id, amount, ip_address)
            response_data = gateway_data["requestData"]
            payment_url = gateway_data["paymentUrl"]
            qr_code_url = payment_url
            deeplink = None
            request_id = None
            provider_message = "VNPay payment URL created"
        else:
            gateway_data = MoMoService.create_payment(order.id, amount)
            response_data = gateway_data["responseData"]
            if response_data.get("resultCode") != 0:
                raise HTTPException(502, response_data.get("message") or "MoMo payment creation failed")
            payment_url = response_data.get("payUrl")
            qr_code_url = gateway_data.get("qrCodeImage")
            deeplink = response_data.get("deeplink")
            request_id = gateway_data["requestId"]
            provider_message = response_data.get("message")

        payment_payload = {
            "method": method,
            "status": "PENDING",
            "amount": float(amount),
            "providerOrderId": gateway_data["providerOrderId"],
            "requestId": request_id,
            "transactionId": None,
            "paymentUrl": payment_url,
            "qrCodeUrl": qr_code_url,
            "deeplink": deeplink,
            "providerMessage": provider_message,
            "providerResponse": PaymentService._json(response_data),
            "paidAt": None,
        }

        if existing:
            payment = await prisma.payment.update(where={"id": existing.id}, data=payment_payload)
            event_type = "RETRY_CREATED"
        else:
            payment = await prisma.payment.create(
                data={
                    **payment_payload,
                    "order": {"connect": {"id": order.id}},
                }
            )
            event_type = "CREATED"

        if PaymentService._to_value(order.status) in {"PENDING", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}:
            await prisma.order.update(where={"id": order.id}, data={"status": "PENDING_PAYMENT"})
            await prisma.ordershoppackage.update_many(
                where={"orderId": order.id, "status": {"in": ["PENDING", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]}},
                data={"status": "PENDING_PAYMENT"},
            )

        await PaymentService._create_event(
            payment=payment,
            event_type=event_type,
            status="PENDING",
            payload=response_data,
            message=provider_message,
        )

        return PaymentGatewayOut(
            payment=PaymentService._to_out(payment),
            paymentUrl=payment_url,
            qrCodeUrl=qr_code_url,
            deeplink=deeplink,
            providerOrderId=gateway_data["providerOrderId"],
            requestId=request_id,
        )

    @staticmethod
    async def handle_vnpay_return(data: dict):
        if not VNPayService.verify_payment(data):
            raise HTTPException(400, "Invalid VNPay signature")

        provider_order_id = data.get("vnp_TxnRef")
        if not provider_order_id:
            raise HTTPException(400, "Missing VNPay transaction reference")

        status = "SUCCESS" if VNPayService.is_success(data) else "FAILED"
        payment = await PaymentService._update_gateway_callback(
            provider_order_id=provider_order_id,
            status=status,
            callback_data=data,
            transaction_id=data.get("vnp_TransactionNo"),
            provider_message=data.get("vnp_Message") or data.get("vnp_ResponseCode"),
        )
        return {
            "success": status == "SUCCESS",
            "payment": PaymentService._to_out(payment),
        }

    @staticmethod
    async def handle_momo_callback(data: dict):
        if not MoMoService.verify_signature(data):
            raise HTTPException(400, "Invalid MoMo signature")

        provider_order_id = data.get("orderId")
        if not provider_order_id:
            raise HTTPException(400, "Missing MoMo orderId")

        status = "SUCCESS" if MoMoService.is_success(data) else "FAILED"
        payment = await PaymentService._update_gateway_callback(
            provider_order_id=provider_order_id,
            status=status,
            callback_data=data,
            transaction_id=str(data.get("transId")) if data.get("transId") is not None else None,
            provider_message=data.get("message") or str(data.get("resultCode")),
        )
        return {
            "success": status == "SUCCESS",
            "payment": PaymentService._to_out(payment),
        }

    @staticmethod
    async def get_payment(payment_id: int, current_user=None) -> PaymentOut:
        payment = await prisma.payment.find_unique(
            where={"id": payment_id},
            include={"order": True},
        )
        if not payment:
            raise HTTPException(404, "Payment not found")
        if current_user is not None:
            role = get_role_value(current_user)
            if role != "ADMIN" and payment.order.userId != current_user.id:
                raise HTTPException(403, "Forbidden")

        payment = await PaymentService._sync_gateway_status_if_pending(payment)
        return PaymentService._to_out(payment)

    @staticmethod
    async def update_payment_status(payment_id: int, status: str) -> PaymentOut:
        payment = await prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(404, "Payment not found")
        status = PaymentService._normalize_status(status)

        updated = await prisma.payment.update(
            where={"id": payment_id},
            data={
                "status": status,
                "paidAt": datetime.utcnow() if status in PAYMENT_SUCCESS_STATUSES else None,
            },
        )
        await PaymentService._sync_order_payment_status(payment.orderId, status)
        await PaymentService._create_event(
            payment=updated,
            event_type="MANUAL_UPDATE",
            status=status,
            message=f"Payment manually updated to {status}",
        )
        await PaymentService._notify_payment_update(updated, status)
        return PaymentService._to_out(updated)

    @staticmethod
    async def get_payment_by_order(order_id: int) -> PaymentOut:
        payment = await prisma.payment.find_unique(where={"orderId": order_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        payment = await PaymentService._sync_gateway_status_if_pending(payment)
        return PaymentService._to_out(payment)

    @staticmethod
    async def expire_payment_by_order(order_id: int, current_user) -> PaymentOut:
        order = await prisma.order.find_unique(
            where={"id": order_id},
            include={"payment": True},
        )
        if not order:
            raise HTTPException(404, "Order not found")
        if order.userId != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")
        if not order.payment:
            raise HTTPException(404, "Payment not found")

        payment_status = PaymentService._to_value(order.payment.status)
        order_status = PaymentService._to_value(order.status)
        if payment_status not in PAYMENT_PENDING_STATUSES or order_status != "PENDING_PAYMENT":
            return PaymentService._to_out(order.payment)

        updated_count = await prisma.payment.update_many(
            where={"id": order.payment.id, "status": {"in": list(PAYMENT_PENDING_STATUSES)}},
            data={
                "status": "PAYMENT_EXPIRED",
                "providerMessage": "Payment session expired before gateway confirmation",
            },
        )
        if updated_count > 0:
            updated = await prisma.payment.find_unique(where={"id": order.payment.id})
            if updated:
                await PaymentService._sync_order_payment_status(order_id, "PAYMENT_EXPIRED")
                await PaymentService._create_event(
                    payment=updated,
                    event_type="STATUS_SYNCED",
                    status="PAYMENT_EXPIRED",
                    message="Payment session expired before gateway confirmation",
                )
                return PaymentService._to_out(updated)

        latest = await prisma.payment.find_unique(where={"id": order.payment.id})
        return PaymentService._to_out(latest or order.payment)

    @staticmethod
    async def get_all_payments() -> list[PaymentOut]:
        payments = await prisma.payment.find_many()
        return [PaymentService._to_out(payment) for payment in payments]

    @staticmethod
    async def get_payment_events(payment_id: int):
        payment = await prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(404, "Payment not found")
        return await prisma.paymentevent.find_many(
            where={"paymentId": payment_id},
            order={"createdAt": "desc"},
        )

    @staticmethod
    async def get_payments_by_status(status: str) -> list[PaymentOut]:
        payments = await prisma.payment.find_many(where={"status": status})
        return [PaymentService._to_out(payment) for payment in payments]

    @staticmethod
    async def get_payments_by_method(method: str) -> list[PaymentOut]:
        payments = await prisma.payment.find_many(where={"method": method})
        return [PaymentService._to_out(payment) for payment in payments]

    @staticmethod
    async def _update_gateway_callback(provider_order_id: str, status: str, callback_data: dict, transaction_id: str | None, provider_message: str | None):
        payment = await prisma.payment.find_unique(where={"providerOrderId": provider_order_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        status = PaymentService._normalize_status(status)
        current_status = PaymentService._to_value(payment.status)
        if current_status in PAYMENT_SUCCESS_STATUSES | PAYMENT_FAILED_STATUSES | {"PAYMENT_EXPIRED", "REFUNDED", "PARTIALLY_REFUNDED", "REFUND_FAILED"}:
            return payment

        callback_amount = PaymentService._callback_amount(callback_data)
        if callback_amount is not None and int(round(float(payment.amount or 0))) != callback_amount:
            raise HTTPException(400, "Payment callback amount mismatch")

        update_data = {
            "status": status,
            "transactionId": transaction_id,
            "providerMessage": provider_message,
            "rawCallback": PaymentService._json(callback_data),
            "providerResponse": PaymentService._json(callback_data),
            "paidAt": datetime.utcnow() if status in PAYMENT_SUCCESS_STATUSES else None,
        }
        async with prisma.tx() as tx:
            updated_count = await tx.payment.update_many(
                where={
                    "id": payment.id,
                    "status": {"in": list(PAYMENT_PENDING_STATUSES)},
                },
                data=update_data,
            )
            if updated_count == 0:
                return await tx.payment.find_unique(where={"id": payment.id}) or payment
            updated = await tx.payment.find_unique(where={"id": payment.id})

        if not updated:
            raise HTTPException(404, "Payment not found")

        await PaymentService._sync_order_payment_status(payment.orderId, status)
        await PaymentService._create_event(
            payment=updated,
            event_type="CALLBACK_RECEIVED",
            status=status,
            payload=callback_data,
            transaction_id=transaction_id,
            message=provider_message,
        )
        await PaymentService._notify_payment_update(updated, status)
        return updated

    @staticmethod
    async def retry_payment(payment_id: int, current_user, ip_address: str) -> PaymentGatewayOut:
        payment = await prisma.payment.find_unique(where={"id": payment_id}, include={"order": True})
        if not payment:
            raise HTTPException(404, "Payment not found")
        if payment.order.userId != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")
        if PaymentService._to_value(payment.status) in PAYMENT_SUCCESS_STATUSES:
            raise HTTPException(400, "Payment is already successful")
        return await PaymentService.create_gateway_payment(
            PaymentGatewayCreate(orderId=payment.orderId, method=PaymentService._to_value(payment.method)),
            current_user,
            ip_address,
        )

    @staticmethod
    async def _sync_gateway_status_if_pending(payment):
        method = PaymentService._to_value(payment.method).upper()
        status = PaymentService._to_value(payment.status)
        if method != "MOMO" or status not in PAYMENT_PENDING_STATUSES or not payment.providerOrderId:
            return payment

        try:
            query_response = MoMoService.query_payment(
                provider_order_id=payment.providerOrderId,
                request_id=payment.requestId,
            )
        except Exception:
            return payment

        result_code = str(query_response.get("resultCode"))
        if result_code == "0":
            return await PaymentService._update_gateway_callback(
                provider_order_id=payment.providerOrderId,
                status="SUCCESS",
                callback_data=query_response,
                transaction_id=str(query_response.get("transId")) if query_response.get("transId") is not None else None,
                provider_message=query_response.get("message") or result_code,
            )

        if result_code in MOMO_PENDING_RESULT_CODES:
            return payment

        return await PaymentService._update_gateway_callback(
            provider_order_id=payment.providerOrderId,
            status="FAILED",
            callback_data=query_response,
            transaction_id=str(query_response.get("transId")) if query_response.get("transId") is not None else None,
            provider_message=query_response.get("message") or result_code,
        )

    @staticmethod
    async def _sync_order_payment_status(order_id: int, payment_status: str):
        payment_status = PaymentService._normalize_status(payment_status)
        if payment_status in PAYMENT_SUCCESS_STATUSES:
            order = await prisma.order.find_unique(where={"id": order_id})
            if order and PaymentService._to_value(order.status) in {"PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"}:
                await prisma.order.update(where={"id": order_id}, data={"status": "PAID"})
                await prisma.ordershoppackage.update_many(
                    where={"orderId": order_id, "status": {"in": ["PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]}},
                    data={"status": "PAID"},
                )
                await PaymentService._clear_paid_order_cart_items(order_id)
                await PaymentService._notify_order_visible(order_id, "PAID")
        elif payment_status in PAYMENT_FAILED_STATUSES:
            order = await prisma.order.find_unique(where={"id": order_id})
            if order and PaymentService._to_value(order.status) == "PENDING_PAYMENT":
                await PaymentService._mark_payment_hold_failed(order_id, "PAYMENT_FAILED")
        elif payment_status == "PAYMENT_EXPIRED":
            order = await prisma.order.find_unique(where={"id": order_id})
            if order and PaymentService._to_value(order.status) == "PENDING_PAYMENT":
                await PaymentService._mark_payment_hold_failed(order_id, "PAYMENT_EXPIRED")

    @staticmethod
    async def _mark_payment_hold_failed(order_id: int, next_status: str):
        async with prisma.tx() as tx:
            updated_count = await tx.order.update_many(
                where={"id": order_id, "status": "PENDING_PAYMENT"},
                data={"status": next_status},
            )
            if updated_count == 0:
                return
            await tx.ordershoppackage.update_many(
                where={"orderId": order_id, "status": "PENDING_PAYMENT"},
                data={"status": next_status},
            )
            await PaymentService._release_order_reservation(tx, order_id)

    @staticmethod
    async def _release_order_reservation(client, order_id: int):
        order = await client.order.find_unique(
            where={"id": order_id},
            include={"items": True, "couponRedemptions": True},
        )
        if not order:
            return

        for item in order.items:
            if item.variantId:
                variant = await client.productvariant.find_unique(where={"id": item.variantId})
                if variant:
                    stock_before = variant.stock or 0
                    stock_after = stock_before + item.quantity
                    await client.productvariant.update(
                        where={"id": variant.id},
                        data={"stock": stock_after},
                    )
                    await InventoryService.record(
                        client,
                        {
                            "shopId": item.shopId,
                            "productId": item.productId,
                            "variantId": item.variantId,
                            "orderId": order_id,
                            "actorId": order.userId,
                            "type": "CANCEL_RESTORE",
                            "quantityChange": item.quantity,
                            "stockBefore": stock_before,
                            "stockAfter": stock_after,
                            "reason": "Release stock after gateway payment failed or expired",
                            "metadata": {"orderItemId": item.id, "productName": item.productName},
                        },
                    )

        await PaymentService._restore_flash_sale_sales(client, order)
        await PaymentService._release_coupon_redemptions(client, order_id)

    @staticmethod
    async def _release_coupon_redemptions(client, order_id: int):
        redemptions = await client.couponredemption.find_many(where={"orderId": order_id})
        for redemption in redemptions:
            await client.coupon.update_many(
                where={"id": redemption.couponId, "usedCount": {"gt": 0}},
                data={"usedCount": {"decrement": 1}},
            )
        if redemptions:
            await client.couponredemption.delete_many(where={"orderId": order_id})

    @staticmethod
    async def _restore_flash_sale_sales(client, order):
        order_created_at = getattr(order, "createdAt", None)
        if not order_created_at:
            return

        flash_sales = await client.flashsale.find_many(
            where={
                "startsAt": {"lte": order_created_at},
                "endsAt": {"gte": order_created_at},
            }
        )
        flash_sale_ids = [flash_sale.id for flash_sale in flash_sales]
        if not flash_sale_ids:
            return

        for item in getattr(order, "items", []) or []:
            quantity = int(getattr(item, "quantity", 0) or 0)
            if quantity <= 0:
                continue
            where = {
                "flashSaleId": {"in": flash_sale_ids},
                "productId": item.productId,
                "shopId": item.shopId,
                "salePrice": float(item.price or 0),
                "soldCount": {"gte": quantity},
            }
            where["variantId"] = item.variantId if item.variantId else None
            sale_item = await client.flashsaleitem.find_first(where=where)
            if sale_item:
                await client.flashsaleitem.update_many(
                    where={"id": sale_item.id, "soldCount": {"gte": quantity}},
                    data={"soldCount": {"decrement": quantity}},
                )

    @staticmethod
    async def _clear_paid_order_cart_items(order_id: int):
        order = await prisma.order.find_unique(where={"id": order_id}, include={"items": True})
        order_items = getattr(order, "items", None) if order else None
        if not order or not order_items:
            return
        cart = await prisma.cart.find_unique(where={"userId": order.userId})
        if not cart:
            return
        item_filters = [
            {
                "productId": item.productId,
                "variantId": item.variantId,
                "shopId": item.shopId,
            }
            for item in order_items
        ]
        if item_filters:
            await prisma.cartitem.delete_many(where={"cartId": cart.id, "OR": item_filters})

    @staticmethod
    async def _notify_order_visible(order_id: int, status: str):
        try:
            order = await prisma.order.find_unique(
                where={"id": order_id},
                include={"items": {"include": {"shop": True}}},
            )
            if not order:
                return
            recipients = {order.userId}
            for item in order.items:
                if item.shop and item.shop.ownerId:
                    recipients.add(item.shop.ownerId)
            for user_id in recipients:
                await NotificationService.create(
                    NotificationCreate(
                        userId=user_id,
                        title="Đơn hàng đã thanh toán",
                        content=f"Đơn hàng #{order_id} đã thanh toán thành công và được tạo hóa đơn.",
                        type="ORDER_UPDATE",
                        metadata={"orderId": order_id, "status": status},
                    )
                )
        except Exception:
            return None

    @staticmethod
    async def _create_event(payment, event_type: str, status: str | None = None, payload: dict | None = None, transaction_id: str | None = None, message: str | None = None):
        try:
            retry_count = await prisma.paymentevent.count(where={"paymentId": payment.id})
            event_data = {
                "paymentId": payment.id,
                "orderId": payment.orderId,
                "provider": PaymentService._to_value(payment.method),
                "eventType": event_type,
                "status": status or PaymentService._to_value(payment.status),
                "providerOrderId": payment.providerOrderId,
                "requestId": payment.requestId,
                "transactionId": transaction_id or payment.transactionId,
                "message": message,
                "retryCount": retry_count,
            }
            if payload is not None:
                event_data["payload"] = PaymentService._json(payload)
            await prisma.paymentevent.create(
                data=event_data
            )
            await AuditService.create(
                action=f"PAYMENT.{event_type}",
                entity_type="Payment",
                entity_id=payment.id,
                target_user_id=None,
                severity="INFO" if status != "FAILED" else "WARNING",
                metadata={
                    "orderId": payment.orderId,
                    "status": status,
                    "providerOrderId": payment.providerOrderId,
                    "transactionId": transaction_id,
                },
            )
        except Exception:
            return None

    @staticmethod
    async def _notify_payment_update(payment, status: str):
        try:
            order = await prisma.order.find_unique(where={"id": payment.orderId})
            if not order:
                return
            title = "Thanh toán thành công" if status in PAYMENT_SUCCESS_STATUSES else "Thanh toán chưa thành công"
            content = (
                f"Đơn hàng #{payment.orderId} đã được thanh toán thành công."
                if status in PAYMENT_SUCCESS_STATUSES
                else f"Thanh toán đơn hàng #{payment.orderId} thất bại hoặc bị từ chối. Bạn có thể thử lại."
            )
            await NotificationService.create(
                NotificationCreate(
                    userId=order.userId,
                    title=title,
                    content=content,
                    type="PAYMENT_UPDATE",
                    metadata={"orderId": payment.orderId, "paymentId": payment.id, "status": status},
                )
            )
        except Exception:
            return None

    @staticmethod
    def _to_out(payment) -> PaymentOut:
        data = payment.model_dump()
        data["method"] = PaymentService._to_value(data.get("method"))
        data["status"] = PaymentService._to_value(data.get("status"))
        return PaymentOut(**data)

    @staticmethod
    def _to_value(value):
        return value.value if hasattr(value, "value") else str(value)

    @staticmethod
    def _json(value):
        return Json(value) if value is not None else None

    @staticmethod
    def _callback_amount(callback_data: dict) -> int | None:
        raw_amount = callback_data.get("amount")
        if raw_amount is None and callback_data.get("vnp_Amount") is not None:
            raw_amount = int(callback_data["vnp_Amount"]) / 100
        if raw_amount is None:
            return None
        try:
            return int(round(float(raw_amount)))
        except (TypeError, ValueError):
            return None
