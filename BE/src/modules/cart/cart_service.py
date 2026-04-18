from src.core.database import prisma
from fastapi import HTTPException
from datetime import datetime


class CartService:
    async def create_cart(self, data):
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
            include={
                "items": {
                    "include": {
                        "product": True,
                        "variant": True
                    }
                }
            }
        )

        if not cart:
            raise HTTPException(404, "Cart not found")

        return self._attach_total(cart)

    async def get_cart_by_user(self, user_id: int):
        cart = await prisma.cart.find_unique(
            where={"userId": user_id},
            include={
                "items": {
                    "include": {
                        "product": True,
                        "variant": True
                    }
                }
            }
        )

        if not cart:
            raise HTTPException(404, "Cart not found")

        return self._attach_total(cart)

    # ======================
    # ADD ITEM
    # ======================
    async def add_item(self, data):
        cart = await prisma.cart.find_unique(
            where={"id": data.cartId}
        )
        if not cart:
            raise HTTPException(404, "Cart does not exist")

        # Validate product
        product = await prisma.product.find_unique(
            where={"id": data.productId}
        )
        if not product:
            raise HTTPException(400, "Product not found")

        # Validate variant
        variant = None
        if data.variantId:
            variant = await prisma.productvariant.find_unique(
                where={"id": data.variantId}
            )
            if not variant:
                raise HTTPException(400, "Variant not found")

            if variant.productId != data.productId:
                raise HTTPException(400, "Variant does not belong to product")

        # Validate quantity
        if data.quantity <= 0:
            raise HTTPException(400, "Quantity must be > 0")

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
        if quantity < 0:
            raise HTTPException(400, "Quantity must be >= 0")

        item = await prisma.cartitem.find_unique(where={"id": item_id})
        if not item:
            raise HTTPException(404, "Item not found")

        # Auto delete nếu = 0
        if quantity == 0:
            await prisma.cartitem.delete(where={"id": item_id})
            return {"message": "Item removed"}

        return await prisma.cartitem.update(
            where={"id": item_id},
            data={"quantity": quantity}
        )
    async def delete_item(self, item_id: int):
        item = await prisma.cartitem.find_unique(where={"id": item_id})
        if not item:
            raise HTTPException(404, "Item not found")

        return await prisma.cartitem.delete(
            where={"id": item_id}
        )

    async def clear_cart(self, cart_id: int):
        cart = await prisma.cart.find_unique(where={"id": cart_id})
        if not cart:
            raise HTTPException(404, "Cart not found")

        await prisma.cartitem.delete_many(
            where={"cartId": cart_id}
        )

        return {"message": "Cart cleared"}

    async def delete_cart(self, cart_id: int):
        cart = await prisma.cart.find_unique(where={"id": cart_id})
        if not cart:
            raise HTTPException(404, "Cart not found")

        return await prisma.cart.delete(
            where={"id": cart_id}
        )
    def _attach_total(self, cart):
        total = 0

        for item in cart.items:
            price = 0

            if item.variant:
                price = item.variant.price
            elif item.product:
                price = item.product.price

            total += price * item.quantity

        cart.totalAmount = total
        return cart