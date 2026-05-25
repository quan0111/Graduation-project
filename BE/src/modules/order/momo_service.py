import hashlib
import hmac
import base64
from io import BytesIO
import json
import uuid
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException

from src.core.config import settings


class MoMoService:
    REQUEST_TYPE = "captureWallet"

    @staticmethod
    def create_payment(order_id: int, amount: int, provider_order_id: str | None = None, request_id: str | None = None):
        MoMoService._assert_configured()
        if int(amount) < 1000:
            raise HTTPException(400, "MoMo payment amount must be at least 1000 VND")

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
        qr_code_raw = response.get("qrCodeUrl") or response.get("deeplink") or response.get("payUrl")
        qr_code_image = MoMoService.create_qr_code_data_uri(qr_code_raw) if qr_code_raw else None
        return {
            "providerOrderId": provider_order_id,
            "requestId": request_id,
            "requestData": payload,
            "responseData": response,
            "qrCodeRawData": qr_code_raw,
            "qrCodeImage": qr_code_image,
        }

    @staticmethod
    def query_payment(provider_order_id: str, request_id: str | None = None):
        MoMoService._assert_configured()
        request_id = request_id or str(uuid.uuid4())
        raw_signature = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&orderId={provider_order_id}"
            f"&partnerCode={settings.MOMO_PARTNER_CODE}"
            f"&requestId={request_id}"
        )
        payload = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "requestId": request_id,
            "orderId": provider_order_id,
            "lang": "vi",
            "signature": MoMoService._sign(raw_signature),
        }

        response = MoMoService._post_json(
            settings.MOMO_ENDPOINT.replace("/create", "/query"),
            payload,
        )
        if response.get("signature") and not MoMoService.verify_signature(response):
            raise HTTPException(400, "Invalid MoMo query signature")
        return response

    @staticmethod
    def refund(
        *,
        return_id: int,
        amount: int,
        original_transaction_id: str,
        description: str | None = None,
        request_id: str | None = None,
        refund_order_id: str | None = None,
    ):
        MoMoService._assert_configured()
        if int(amount) <= 0:
            raise HTTPException(400, "MoMo refund amount must be greater than 0")
        if not original_transaction_id:
            raise HTTPException(400, "MoMo refund requires original transaction id")

        request_id = request_id or str(uuid.uuid4())
        refund_order_id = refund_order_id or f"REFUND-{return_id}-{uuid.uuid4().hex[:12]}"
        description = description or f"Refund return #{return_id}"
        raw_signature = (
            f"accessKey={settings.MOMO_ACCESS_KEY}"
            f"&amount={int(amount)}"
            f"&description={description}"
            f"&orderId={refund_order_id}"
            f"&partnerCode={settings.MOMO_PARTNER_CODE}"
            f"&requestId={request_id}"
            f"&transId={original_transaction_id}"
        )
        payload = {
            "partnerCode": settings.MOMO_PARTNER_CODE,
            "orderId": refund_order_id,
            "requestId": request_id,
            "amount": int(amount),
            "transId": original_transaction_id,
            "lang": "vi",
            "description": description,
            "signature": MoMoService._sign(raw_signature),
        }

        response = MoMoService._post_json(
            settings.MOMO_ENDPOINT.replace("/create", "/refund"),
            payload,
        )
        return {
            "requestData": payload,
            "responseData": response,
            "success": str(response.get("resultCode")) == "0",
            "transactionId": str(response.get("transId") or response.get("refundTransId") or refund_order_id),
            "message": response.get("message") or response.get("localMessage"),
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
    def create_qr_code_data_uri(qr_data: str) -> str:
        if not qr_data:
            raise HTTPException(502, "MoMo did not return QR data")

        try:
            import qrcode

            image = qrcode.make(qr_data)
            buffer = BytesIO()
            image.save(buffer, format="PNG")
            encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
            return f"data:image/png;base64,{encoded}"
        except ImportError:
            pass

        try:
            import cv2

            encoder = cv2.QRCodeEncoder_create()
            image = encoder.encode(qr_data)
            success, buffer = cv2.imencode(".png", image)
            if not success:
                raise RuntimeError("OpenCV could not encode QR PNG")
            encoded = base64.b64encode(buffer.tobytes()).decode("ascii")
            return f"data:image/png;base64,{encoded}"
        except ImportError as exc:
            raise HTTPException(500, "QR generation dependency is missing. Install qrcode[pil].") from exc
        except Exception as exc:
            raise HTTPException(500, "Cannot generate MoMo QR image") from exc

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
        except HTTPError as exc:
            raw = exc.read().decode("utf-8", errors="replace")
            try:
                error_data = json.loads(raw)
            except json.JSONDecodeError:
                error_data = {"message": raw}
            message = error_data.get("message") or error_data.get("localMessage") or "MoMo gateway rejected the request"
            raise HTTPException(
                502,
                {
                    "message": message,
                    "resultCode": error_data.get("resultCode"),
                    "response": error_data,
                },
            ) from exc
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
