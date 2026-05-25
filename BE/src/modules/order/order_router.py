from typing import List

from fastapi import APIRouter, Depends, Request, Response

from src.core.dependencies import get_current_user, require_admin, require_seller
from src.modules.order.order_schema import (
    CheckoutCreate,
    CheckoutOut,
    CancelOrderRequest,
    OrderCreate,
    OrderOut,
    OrderUpdate,
    PaymentCreate,
    PaymentGatewayCreate,
    PaymentGatewayOut,
    PaymentOut,
    PaymentUpdate,
)
from src.modules.order.order_service import OrderService
from src.modules.order.payment_service import PaymentService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", response_model=OrderOut)
async def create_order(
    order_data: OrderCreate,
    user=Depends(get_current_user),
):
    return await OrderService.create_order(user, order_data)


@router.post("/checkout", response_model=CheckoutOut)
async def checkout(
    checkout_data: CheckoutCreate,
    request: Request,
    user=Depends(get_current_user),
):
    client_host = request.client.host if request.client else "127.0.0.1"
    return await OrderService.checkout(user, checkout_data, client_host)


@router.post("/payment", response_model=PaymentOut)
async def create_payment(payment_data: PaymentCreate, user=Depends(get_current_user)):
    return await PaymentService.create_payment(payment_data, user)


@router.post("/payment/qr", response_model=PaymentGatewayOut)
async def create_qr_payment(payment_data: PaymentGatewayCreate, request: Request, user=Depends(get_current_user)):
    client_host = request.client.host if request.client else "127.0.0.1"
    return await PaymentService.create_gateway_payment(payment_data, user, client_host)


@router.get("/payment/order/{order_id}", response_model=PaymentOut)
async def get_payment_by_order(order_id: int, user=Depends(get_current_user)):
    await OrderService.assert_order_visibility(order_id, user)
    return await PaymentService.get_payment_by_order(order_id)


@router.post("/payment/order/{order_id}/expire", response_model=PaymentOut)
async def expire_payment_by_order(order_id: int, user=Depends(get_current_user)):
    return await PaymentService.expire_payment_by_order(order_id, user)


@router.get("/payment/vnpay/return")
async def vnpay_return(request: Request):
    return await PaymentService.handle_vnpay_return(dict(request.query_params))


@router.post("/payment/momo/ipn")
async def momo_ipn(payload: dict):
    await PaymentService.handle_momo_callback(payload)
    return Response(status_code=204)


@router.get("/payment/momo/return")
async def momo_return(request: Request):
    return await PaymentService.handle_momo_callback(dict(request.query_params))


@router.get("/payment/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int, user=Depends(get_current_user)):
    return await PaymentService.get_payment(payment_id, user)


@router.get("/payment/{payment_id}/events")
async def get_payment_events(payment_id: int, user=Depends(require_admin)):
    _ = user
    return await PaymentService.get_payment_events(payment_id)


@router.post("/payment/{payment_id}/retry", response_model=PaymentGatewayOut)
async def retry_payment(payment_id: int, request: Request, user=Depends(get_current_user)):
    client_host = request.client.host if request.client else "127.0.0.1"
    return await PaymentService.retry_payment(payment_id, user, client_host)


@router.patch("/payment/{payment_id}")
async def update_payment_by_id(
    payment_id: int,
    payment_data: PaymentUpdate,
    user=Depends(require_admin),
):
    _ = user
    return await PaymentService.update_payment_status(payment_id, payment_data.status)


@router.get("/payment", response_model=List[PaymentOut])
async def get_all_payments(user=Depends(require_admin)):
    _ = user
    return await PaymentService.get_all_payments()


@router.get("/seller", response_model=List[OrderOut])
async def get_seller_orders(user=Depends(require_seller)):
    return await OrderService.get_seller_orders(user)


@router.get("/seller/{order_id}", response_model=OrderOut)
async def get_seller_order(order_id: int, user=Depends(require_seller)):
    return await OrderService.get_seller_order(order_id, user)


@router.get("/", response_model=List[OrderOut])
async def get_my_orders(user=Depends(get_current_user)):
    return await OrderService.get_my_orders(user)


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int, user=Depends(get_current_user)):
    return await OrderService.get_order(order_id, user)


@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    user=Depends(get_current_user),
):
    return await OrderService.update_order(order_id, user, order_data)


@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: int, data: CancelOrderRequest | None = None, user=Depends(get_current_user)):
    await OrderService.cancel_order(order_id, user, data.reason if data else None, data.note if data else None)
    return {"message": "Order cancelled successfully"}


@router.patch("/{order_id}/payment")
async def update_payment(
    order_id: int,
    payment_data: PaymentUpdate,
    user=Depends(require_admin),
):
    _ = user
    order = await OrderService._get_order_or_404(order_id)
    if not order.payment:
        return {"message": "Payment not found for this order"}

    return await PaymentService.update_payment_status(
        order.payment.id,
        payment_data.status,
    )
