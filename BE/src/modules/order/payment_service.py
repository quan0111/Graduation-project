from datetime import datetime

from fastapi import HTTPException
from prisma import Json

from src.core.database import prisma
from src.core.dependencies import get_role_value
from src.modules.audit.audit_service import AuditService
from src.modules.notification.notification_schema import NotificationCreate
from src.modules.notification.notification_service import NotificationService
from src.modules.order.momo_service import MoMoService
from src.modules.order.order_schema import PaymentCreate, PaymentGatewayCreate, PaymentGatewayOut, PaymentOut
from src.modules.order.vnpay_service import VNPayService


class PaymentService:
    GATEWAY_METHODS = {"MOMO", "VNPAY"}

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
        if existing and PaymentService._to_value(existing.status) == "SUCCESS":
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

        return PaymentService._to_out(payment)

    @staticmethod
    async def update_payment_status(payment_id: int, status: str) -> PaymentOut:
        payment = await prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        updated = await prisma.payment.update(
            where={"id": payment_id},
            data={
                "status": status,
                "paidAt": datetime.utcnow() if status == "SUCCESS" else None,
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

        return PaymentService._to_out(payment)

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

        updated = await prisma.payment.update(
            where={"id": payment.id},
            data={
                "status": status,
                "transactionId": transaction_id,
                "providerMessage": provider_message,
                "rawCallback": PaymentService._json(callback_data),
                "providerResponse": PaymentService._json(callback_data),
                "paidAt": datetime.utcnow() if status == "SUCCESS" else None,
            },
        )
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
        if PaymentService._to_value(payment.status) == "SUCCESS":
            raise HTTPException(400, "Payment is already successful")
        return await PaymentService.create_gateway_payment(
            PaymentGatewayCreate(orderId=payment.orderId, method=PaymentService._to_value(payment.method)),
            current_user,
            ip_address,
        )

    @staticmethod
    async def _sync_order_payment_status(order_id: int, payment_status: str):
        if payment_status == "SUCCESS":
            order = await prisma.order.find_unique(where={"id": order_id})
            if order and PaymentService._to_value(order.status) in {"PENDING", "PAYMENT_FAILED"}:
                await prisma.order.update(where={"id": order_id}, data={"status": "PAID"})
        elif payment_status == "FAILED":
            order = await prisma.order.find_unique(where={"id": order_id})
            if order and PaymentService._to_value(order.status) == "PENDING":
                await prisma.order.update(where={"id": order_id}, data={"status": "PAYMENT_FAILED"})

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
            title = "Thanh toán thành công" if status == "SUCCESS" else "Thanh toán chưa thành công"
            content = (
                f"Đơn hàng #{payment.orderId} đã được thanh toán thành công."
                if status == "SUCCESS"
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
