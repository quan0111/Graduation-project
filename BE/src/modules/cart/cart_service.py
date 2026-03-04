from core.database import prisma
from fastapi import HTTPException


class CartService:


    async def create_cart(self, data):
        # Check user already has cart
        existing = await prisma.cart.find_unique(
            where={"userId": data.userId}
        )

        if existing:
            raise HTTPException(400, "User already has a cart")

        return await prisma.cart.create(
            data=data.model_dump()
        )

    async def get_cart(self, cart_id: int):
        cart = await prisma.cart.find_unique(
            where={"id": cart_id},
            include={"items": True}
        )

        if not cart:
            raise HTTPException(404, "Cart not found")

        return cart

    async def get_cart_by_user(self, user_id: int):
        cart = await prisma.cart.find_unique(
            where={"userId": user_id},
            include={"items": True}
        )

        if not cart:
            raise HTTPException(404, "Cart not found")

        return cart

    async def delete_cart(self, cart_id: int):
        return await prisma.cart.delete(
            where={"id": cart_id}
        )



    async def add_item(self, data):
        # Ensure cart exists
        cart = await prisma.cart.find_unique(
            where={"id": data.cartId}
        )

        if not cart:
            raise HTTPException(404, "Cart does not exist")

        return await prisma.cartitem.upsert(
            where={
                "cartId_productId_variantId": {
                    "cartId": data.cartId,
                    "productId": data.productId,
                    "variantId": data.variantId
                }
            },
            data={
                "create": data.model_dump(),
                "update": {
                    "quantity": {"increment": data.quantity}
                }
            }
        )

    async def update_item(self, item_id: int, quantity: int):
        return await prisma.cartitem.update(
            where={"id": item_id},
            data={"quantity": quantity}
        )

    async def delete_item(self, item_id: int):
        return await prisma.cartitem.delete(
            where={"id": item_id}
        )

    async def clear_cart(self, cart_id: int):
        return await prisma.cartitem.delete_many(
            where={"cartId": cart_id}
        )