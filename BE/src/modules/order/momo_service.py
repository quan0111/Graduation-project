import hashlib
import hmac
import json
import uuid
from urllib.error import URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException

from src.core.config import settings


class MoMoService:
    REQUEST_TYPE = "captureWallet"

    @staticmethod
    def create_payment(order_id: int, amount: int, provider_order_id: str | None = None, request_id: str | None = None):
        MoMoService._assert_configured()

        request_id = request_id or str(uuid.uuid4())
        provider_order_id = provider_order_id or f"ORDER-{order_id}-{uuid.uuid4().hex[:12]}"
        order_info = f"Thanh toan don hang {order_id}"
        extra_data = ""

        raw_signature = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={int(amount)}"
            f"&extraData={extra_data}"
            f"&ipnUrl={settings.MOMO_IPN_URL}"
            f"&orderId={provider_order_id}"
            f"&orderInfo={order_info}"
            f"&partnerCode={settings.MOMO_PARTNER_CODE}"
            f"&redirectUrl={settings.MOMO_REDIRECT_URL}"
            f"&requestId={request_id}"
            f"&requestType={MoMoService.REQUEST_TYPE}"
        )

        payload = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "partnerName": "MarketHub",
            "storeId": "MarketHub",
            "requestId": request_id,
            "amount": int(amount),
            "orderId": provider_order_id,
            "orderInfo": order_info,
            "redirectUrl": settings.MOMO_REDIRECT_URL,
            "ipnUrl": settings.MOMO_IPN_URL,
            "lang": "vi",
            "extraData": extra_data,
            "requestType": MoMoService.REQUEST_TYPE,
            "signature": MoMoService._sign(raw_signature),
        }

        response = MoMoService._post_json(settings.MOMO_ENDPOINT, payload)
        return {
            "providerOrderId": provider_order_id,
            "requestId": request_id,
            "requestData": payload,
            "responseData": response,
        }

    @staticmethod
    def verify_signature(data: dict) -> bool:
        raw_signature = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={data.get('amount')}"
            f"&extraData={data.get('extraData', '')}"
            f"&message={data.get('message')}"
            f"&orderId={data.get('orderId')}"
            f"&orderInfo={data.get('orderInfo')}"
            f"&orderType={data.get('orderType', '')}"
            f"&partnerCode={data.get('partnerCode')}"
            f"&payType={data.get('payType', '')}"
            f"&requestId={data.get('requestId')}"
            f"&responseTime={data.get('responseTime')}"
            f"&resultCode={data.get('resultCode')}"
            f"&transId={data.get('transId')}"
        )
        expected = MoMoService._sign(raw_signature)
        return hmac.compare_digest(expected, str(data.get("signature", "")))

    @staticmethod
    def is_success(data: dict) -> bool:
        return str(data.get("resultCode")) == "0"

    @staticmethod
    def _sign(raw_signature: str) -> str:
        return hmac.new(
            settings.MOMO_SECRET_KEY.encode("utf-8"),
            raw_signature.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

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
        except URLError as exc:
            raise HTTPException(502, "Cannot connect to MoMo gateway") from exc

        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            raise HTTPException(502, "MoMo returned invalid JSON") from exc

    @staticmethod
    def _assert_configured():
        missing = [
            key
            for key, value in {
                "MOMO_ENDPOINT": settings.MOMO_ENDPOINT,
                "MOMO_PARTNER_CODE": settings.MOMO_PARTNER_CODE,
                "MOMO_ACCESS_KEY": settings.MOMO_ACCESS_KEY,
                "MOMO_SECRET_KEY": settings.MOMO_SECRET_KEY,
                "MOMO_REDIRECT_URL": settings.MOMO_REDIRECT_URL,
                "MOMO_IPN_URL": settings.MOMO_IPN_URL,
            }.items()
            if not value
        ]
        if missing:
            raise HTTPException(500, f"MoMo is not configured: {', '.join(missing)}")
