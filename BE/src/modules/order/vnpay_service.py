import uuid
from datetime import datetime

from fastapi import HTTPException

from src.core.config import settings
from src.modules.order.utils.payment import Vnpay


class VNPayService:
    @staticmethod
    def create_payment_url(order_id: int, amount: int, ip_address: str, txn_ref: str | None = None):
        VNPayService._assert_configured()
        vnpay = VNPayService._client()
        provider_order_id = txn_ref or f"{order_id}-{uuid.uuid4().hex[:12]}"

        request_data = {
            "vnp_Version": "2.1.0",
            "vnp_Command": "pay",
            "vnp_TmnCode": settings.VNPAY_TMN_CODE,
            "vnp_Amount": int(amount) * 100,
            "vnp_CurrCode": "VND",
            "vnp_TxnRef": provider_order_id,
            "vnp_OrderInfo": f"Thanh toan don hang {order_id}",
            "vnp_OrderType": "other",
            "vnp_Locale": "vn",
            "vnp_ReturnUrl": settings.VNPAY_RETURN_URL,
            "vnp_IpAddr": ip_address,
            "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S"),
        }

        payment_url = vnpay.get_payment_url(request_data)
        return {
            "providerOrderId": provider_order_id,
            "paymentUrl": payment_url,
            "requestData": request_data,
        }

    @staticmethod
    def verify_payment(data: dict):
        VNPayService._assert_configured()
        payload = dict(data)
        return VNPayService._client().validate_response(payload)

    @staticmethod
    def is_success(data: dict) -> bool:
        return data.get("vnp_ResponseCode") == "00" and data.get("vnp_TransactionStatus") == "00"

    @staticmethod
    def _client():
        return Vnpay(
            tmn_code=settings.VNPAY_TMN_CODE,
            secret_key=settings.VNPAY_HASH_SECRET_KEY,
            return_url=settings.VNPAY_RETURN_URL,
            vnpay_payment_url=settings.VNPAY_PAYMENT_URL,
            api_url=settings.VNPAY_API_URL,
        )

    @staticmethod
    def _assert_configured():
        missing = [
            key
            for key, value in {
                "VNPAY_TMN_CODE": settings.VNPAY_TMN_CODE,
                "VNPAY_HASH_SECRET_KEY": settings.VNPAY_HASH_SECRET_KEY,
                "VNPAY_RETURN_URL": settings.VNPAY_RETURN_URL,
                "VNPAY_PAYMENT_URL": settings.VNPAY_PAYMENT_URL,
            }.items()
            if not value
        ]
        if missing:
            raise HTTPException(500, f"VNPay is not configured: {', '.join(missing)}")
