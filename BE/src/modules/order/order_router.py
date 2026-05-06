from fastapi import APIRouter
from typing import List
from src.modules.order.order_schema import OrderCreate, OrderOut, OrderUpdate, OrderItemCreate, OrderItemOut, PaymentCreate, PaymentOut
from src.modules.order.order_service import OrderService
from src.modules.order.payment_service import PaymentService
router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut)
async def create_order(order_data: OrderCreate):
    new_order = await OrderService.create_order(order_data)
    return new_order
@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int):
    order = await OrderService.get_order(order_id)
    return order
@router.get("/", response_model=List[OrderOut])
async def get_all_orders():
    orders = await OrderService.get_all_orders()
    return orders
@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(order_id: int, order_data: OrderUpdate):
    updated_order = await OrderService.update_order(order_id, order_data)
    return updated_order
@router.patch("/{order_id}/cancel")
async def cancel_order(order_id: int):
    await OrderService.cancel_order(order_id)
    return {"message": "Order cancelled successfully"}
@router.patch("/{order_id}/payment")
async def update_payment(order_id: int, payment_data: OrderUpdate):
    order = await OrderService.get_order(order_id)
    if not order:
        return {"message": "Order not found"}
    if not order.payment:
        return {"message": "Payment not found for this order"}
    updated_payment = await PaymentService.update_payment_status(order.payment.id, payment_data.status)
    return updated_payment
@router.post("/payment", response_model=PaymentOut)
async def create_payment(payment_data: PaymentCreate):
    new_payment = await PaymentService.create_payment(payment_data)
    return new_payment
@router.get("/payment/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int):
    payment = await PaymentService.get_payment(payment_id)
    return payment
@router.patch("/payment/{payment_id}")
async def update_payment(payment_id: int, payment_data: PaymentCreate):
    updated_payment = await PaymentService.update_payment_status(payment_id, payment_data.status)
    return updated_payment
@router.get("/payment/order/{order_id}", response_model=PaymentOut)
async def get_payment_by_order(order_id: int):
    payment = await PaymentService.get_payment_by_order(order_id)
    return payment
@router.get("/payment", response_model=List[PaymentOut])
async def get_all_payments():
    payments = await PaymentService.get_all_payments()
    return payments
