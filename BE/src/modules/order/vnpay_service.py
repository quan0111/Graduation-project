import uuid
from datetime import datetime
import hashlib
import hmac
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

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
    def refund(
        *,
        return_id: int,
        provider_order_id: str,
        amount: int,
        transaction_id: str,
        transaction_date: datetime | None,
        created_by: str,
        ip_address: str = "127.0.0.1",
        full_refund: bool = False,
    ):
        VNPayService._assert_configured(require_api_url=True)
        if int(amount) <= 0:
            raise HTTPException(400, "VNPay refund amount must be greater than 0")
        if not provider_order_id or not transaction_id:
            raise HTTPException(400, "VNPay refund requires original transaction reference and transaction id")

        request_id = f"RF{return_id}{uuid.uuid4().hex[:10]}"
        create_date = datetime.now().strftime("%Y%m%d%H%M%S")
        transaction_date_value = (transaction_date or datetime.now()).strftime("%Y%m%d%H%M%S")
        transaction_type = "02" if full_refund else "03"
        order_info = f"Refund return #{return_id}"
        payload = {
            "vnp_RequestId": request_id,
            "vnp_Version": "2.1.0",
            "vnp_Command": "refund",
            "vnp_TmnCode": settings.VNPAY_TMN_CODE,
            "vnp_TransactionType": transaction_type,
            "vnp_TxnRef": provider_order_id,
            "vnp_Amount": int(amount) * 100,
            "vnp_TransactionNo": transaction_id,
            "vnp_TransactionDate": transaction_date_value,
            "vnp_CreateBy": created_by or "admin",
            "vnp_CreateDate": create_date,
            "vnp_IpAddr": ip_address,
            "vnp_OrderInfo": order_info,
        }
        hash_data = "|".join(str(payload[key]) for key in [
            "vnp_RequestId",
            "vnp_Version",
            "vnp_Command",
            "vnp_TmnCode",
            "vnp_TransactionType",
            "vnp_TxnRef",
            "vnp_Amount",
            "vnp_TransactionNo",
            "vnp_TransactionDate",
            "vnp_CreateBy",
            "vnp_CreateDate",
            "vnp_IpAddr",
            "vnp_OrderInfo",
        ])
        payload["vnp_SecureHash"] = hmac.new(
            settings.VNPAY_HASH_SECRET_KEY.encode("utf-8"),
            hash_data.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

        response = VNPayService._post_json(settings.VNPAY_API_URL, payload)
        return {
            "requestData": payload,
            "responseData": response,
            "success": response.get("vnp_ResponseCode") == "00",
            "transactionId": response.get("vnp_TransactionNo") or transaction_id,
            "message": response.get("vnp_Message") or response.get("vnp_ResponseCode"),
        }

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
    def _post_json(url: str, payload: dict):
        request = Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urlopen(request, timeout=30) as response:
                raw = response.read().decode("utf-8")
        except HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            try:
                error_data = json.loads(raw)
            except json.JSONDecodeError:
                error_data = {"message": raw}
            raise HTTPException(502, error_data) from exc
        except URLError as exc:
            raise HTTPException(502, "Cannot connect to VNPay gateway") from exc

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise HTTPException(502, "VNPay returned invalid JSON") from exc

    @staticmethod
    def _assert_configured(require_api_url: bool = False):
        missing = [
            key
            for key, value in {
                "VNPAY_TMN_CODE": settings.VNPAY_TMN_CODE,
                "VNPAY_HASH_SECRET_KEY": settings.VNPAY_HASH_SECRET_KEY,
                "VNPAY_RETURN_URL": settings.VNPAY_RETURN_URL,
                "VNPAY_PAYMENT_URL": settings.VNPAY_PAYMENT_URL,
                **({"VNPAY_API_URL": settings.VNPAY_API_URL} if require_api_url else {}),
            }.items()
            if not value
        ]
        if missing:
            raise HTTPException(500, f"VNPay is not configured: {', '.join(missing)}")
