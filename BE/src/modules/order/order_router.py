from fastapi import APIRouter
from typing import List
from src.modules.order.order_schema import OrderCreate, OrderOut, OrderUpdate, OrderItemCreate, OrderItemUpdate, OrderItemOut, PaymentCreate, PaymentOut, PaymentUpdate
from src.modules.order.order_service import OrderService
from src.modules.order.payment_service import PaymentService
router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderOut)
async def create_order(order_data: OrderCreate):
    new_order = await OrderService.create_order(order_data)
    return new_order
@router.get("/", response_model=List[OrderOut])
async def get_all_orders():
    orders = await OrderService.get_all_orders()
    return orders
@router.get("/{order_id}", response_model=OrderOut)
async def get_order(order_id: int):
    order = await OrderService.get_order(order_id)
    return order
@router.patch("/{order_id}", response_model=OrderOut)
async def update_order(order_id: int, order_data: OrderUpdate):
    updated_order = await OrderService.update_order(order_id, order_data)
    return updated_order
@router.patch("/{order_id}/delete")
async def delete_order(order_id: int):
    await OrderService.delete_order(order_id)
    return {"message": "Order deleted successfully"}

@router.post("/order-items", response_model=OrderItemOut)
async def add_order_item(order_item_data: OrderItemCreate):
    new_order_item = await OrderService.add_order_item(order_item_data)
    return new_order_item
@router.patch("/order-items/{item_id}", response_model=OrderItemOut)
async def update_order_item(item_id: int, order_item_data: OrderItemUpdate):
    updated_order_item = await OrderService.update_order_item(item_id, order_item_data)
    return updated_order_item
@router.delete("/order-items/{item_id}")
async def delete_order_item(item_id: int):
    await OrderService.delete_order_item(item_id)
    return {"message": "Order item deleted successfully"}
@router.get("/order-items/{order_id}", response_model=List[OrderItemOut])
async def get_order_items(order_id: int):
    order_items = await OrderService.get_order_items(order_id)
    return order_items
@router.get("/order-items/{item_id}", response_model=OrderItemOut)
async def get_order_item(item_id: int):
    order_item = await OrderService.get_order_item(item_id)
    return order_item
@router.post("/payments", response_model=PaymentOut)
async def create_payment(payment_data: PaymentCreate):
    new_payment = await PaymentService.create_payment(payment_data)
    return new_payment
@router.get("/payments/{payment_id}", response_model=PaymentOut)
async def get_payment(payment_id: int):
    payment = await PaymentService.get_payment(payment_id)
    return payment
@router.patch("/payments/{payment_id}", response_model=PaymentOut)
async def update_payment_status(payment_id: int, payment_data: PaymentUpdate):
    updated_payment = await PaymentService.update_payment_status(payment_id, payment_data.status)
    return updated_payment
@router.delete("/payments/{payment_id}")
async def delete_payment(payment_id: int):
    await PaymentService.delete_payment(payment_id)
    return {"message": "Payment deleted successfully"}
@router.get("/payments/order/{order_id}", response_model=List[PaymentOut])
async def get_payments_by_order(order_id: int):
    payments = await PaymentService.get_payments_by_order(order_id)
    return payments
@router.get("/payments/status/{status}", response_model=List[PaymentOut])
async def get_payments_by_status(status: str):
    payments = await PaymentService.get_payments_by_status(status)
    return payments
@router.get("/payments/method/{method}", response_model=List[PaymentOut])
async def get_payments_by_method(method: str):
    payments = await PaymentService.get_payments_by_method(method)
    return payments
@router.get("/payments", response_model=List[PaymentOut])
async def get_all_payments():
    payments = await PaymentService.get_all_payments()
    return payments
