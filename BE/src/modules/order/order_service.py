from fastapi import HTTPException
from src.core.database import prisma
from src.modules.order.order_schema import OrderCreate, OrderUpdate, OrderItemCreate, OrderItemUpdate
from datetime import datetime

class OrderService:
    @staticmethod
    async def create_order(order_data: OrderCreate):
        new_order = await prisma.order.create(data=order_data.dict())
        return new_order

    @staticmethod
    async def get_all_orders():
        orders = await prisma.order.find_many()
        return orders

    @staticmethod
    async def get_order(order_id: int):
        order = await prisma.order.find_unique(where={"id": order_id})
        return order

    @staticmethod
    async def update_order(order_id: int, order_data: OrderUpdate):
        update_data = order_data.dict(exclude_unset=True)
        updated_order = await prisma.order.update(where={"id": order_id}, data=update_data)
        return updated_order

    @staticmethod
    async def delete_order(order_id: int):
        await prisma.order.update( where={"id": order_id}, data={"deletedAt": datetime.utcnow()} )
    
    @staticmethod
    async def add_order_item(order_id: int, item_data: OrderItemCreate):
        order = await prisma.order.find_unique(where={"id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        new_item = await prisma.orderItem.create(data={**item_data.dict(), "orderId": order_id})
        return new_item
    @staticmethod
    async def update_order_item(item_id: int, item_data: OrderItemUpdate):
        update_data = item_data.dict(exclude_unset=True)
        updated_item = await prisma.orderItem.update(where={"id": item_id}, data=update_data)
        return updated_item
    @staticmethod
    async def delete_order_item(item_id: int):
        await prisma.orderItem.update( where={"id": item_id}, data={"deletedAt": datetime.utcnow()} )
    @staticmethod
    async def get_order_items(order_id: int):
        items = await prisma.orderItem.find_many(where={"orderId": order_id})
        return items
    @staticmethod
    async def get_order_item(item_id: int):
        item = await prisma.orderItem.find_unique(where={"id": item_id})
        return item