from typing import List

from fastapi import APIRouter, Depends, Request

from src.core.dependencies import get_current_user
from src.modules.order.order_schema import (
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


@router.post("/payment", response_model=PaymentOut)
async def create_payment(payment_data: PaymentCreate):
    return await PaymentService.create_payment(payment_data)


@router.post("/payment/qr", response_model=PaymentGatewayOut)
async def create_qr_payment(payment_data: PaymentGatewayCreate, request: Request, user=Depends(get_current_user)):
    client_host = request.client.host if request.client else "127.0.0.1"
    return await PaymentService.create_gateway_payment(payment_data, user, client_host)


@router.get("/payment/order/{order_id}", response_model=PaymentOut)
async def get_payment_by_order(order_id: int):
    return await PaymentService.get_payment_by_order(order_id)


@router.get("/payment/vnpay/return")
async def vnpay_return(request: Request):
    return await PaymentService.handle_vnpay_return(dict(request.query_params))


@router.post("/payment/momo/ipn")
async def momo_ipn(payload: dict):
    result = await PaymentService.handle_momo_callback(payload)
    return {
        "resultCode": 0,
        "message": "Received",
        "success": result["success"],
    }


@router.get("/payment/momo/return")
async def momo_return(request: Request):
    return await PaymentService.handle_momo_callback(dict(request.query_params))


@router.get("/payment/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int):
    return await PaymentService.get_payment(payment_id)


@router.patch("/payment/{payment_id}")
async def update_payment_by_id(payment_id: int, payment_data: PaymentUpdate):
    return await PaymentService.update_payment_status(payment_id, payment_data.status)


@router.get("/payment", response_model=List[PaymentOut])
async def get_all_payments():
    return await PaymentService.get_all_payments()


@router.get("/seller", response_model=List[OrderOut])
async def get_seller_orders(user=Depends(get_current_user)):
    return await OrderService.get_seller_orders(user)


@router.get("/seller/{order_id}", response_model=OrderOut)
async def get_seller_order(order_id: int, user=Depends(get_current_user)):
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
async def cancel_order(order_id: int, user=Depends(get_current_user)):
    await OrderService.cancel_order(order_id, user)
    return {"message": "Order cancelled successfully"}


@router.patch("/{order_id}/payment")
async def update_payment(order_id: int, payment_data: OrderUpdate):
    order = await OrderService._get_order_or_404(order_id)
    if not order.payment:
        return {"message": "Payment not found for this order"}

    return await PaymentService.update_payment_status(
        order.payment.id,
        payment_data.status,
    )
