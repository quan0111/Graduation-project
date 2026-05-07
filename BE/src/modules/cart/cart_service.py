from src.core.database import prisma
from fastapi import HTTPException
from src.core.dependencies import get_role_value


class CartService:

    async def get_or_create_cart(self, user_id: int):
        cart = await prisma.cart.find_unique(
            where={"userId": user_id}
        )

        if not cart:
            cart = await prisma.cart.create(
                data={"userId": user_id}
            )

        return cart

    async def get_cart(self, cart_id: int):
        cart = await prisma.cart.find_unique(
            where={"id": cart_id},
            include={
                "items": {
                    "include": {
                        "shop": True,
                        "product": {
                            "include": {
                                "images": True
                            }
                        },
                        "variant": True
                    }
                }
            }
        )

        if not cart:
            raise HTTPException(404, "Cart not found")

        return self._attach_total(cart)

    async def get_cart_for_user(self, cart_id: int, current_user):
        cart = await self.get_cart(cart_id)
        if cart["userId"] != current_user.id and get_role_value(current_user) != "ADMIN":
            raise HTTPException(403, "Forbidden")
        return cart

    async def get_cart_by_user(self, user_id: int):
        cart = await prisma.cart.find_unique(
            where={"userId": user_id},
            include={
                "items": {
                    "include": {
                        "shop": True,
                        "product": {
                            "include": {
                                "images": True
                            }
                        },
                        "variant": True
                    }
                }
            }
        )

        if not cart:
            cart = await prisma.cart.create(
                data={"userId": user_id},
                include={
                    "items": {
                        "include": {
                            "shop": True,
                            "product": {
                                "include": {
                                    "images": True
                                }
                            },
                            "variant": True
                        }
                    }
                }
            )

        return self._attach_total(cart)

    async def add_item(self, user_id: int, data):
        cart = await self.get_or_create_cart(user_id)

        product = await prisma.product.find_unique(
            where={"id": data.productId}
        )
        if not product:
            raise HTTPException(400, "Product not found")

        variant_id = data.variantId if data.variantId else None

        return await prisma.cartitem.upsert(
            where={
                "cartId_productId_variantId_shopId": {
                    "cartId": cart.id,
                    "productId": data.productId,
                    "variantId": data.variantId,
                    "shopId": data.shopId
                }
            },
            data={
                "create": {
                    "shopId": data.shopId,
                    "cartId": cart.id,
                    "productId": data.productId,
                    "variantId": data.variantId,
                    "quantity": data.quantity
                },
                "update": {
                    "quantity": {"increment": data.quantity}
                }
            }
        )

    async def _assert_item_access(self, item_id: int, user_id: int):
        item = await prisma.cartitem.find_unique(
            where={"id": item_id},
            include={"cart": True},
        )
        if not item:
            raise HTTPException(404, "Cart item not found")
        if item.cart.userId != user_id:
            raise HTTPException(403, "Forbidden")
        return item

    async def update_item(self, item_id: int, quantity: int, user_id: int):
        await self._assert_item_access(item_id, user_id)
        if quantity < 0:
            raise HTTPException(400, "Quantity must be >= 0")

        if quantity == 0:
            await prisma.cartitem.delete(where={"id": item_id})
            return {"message": "Item removed"}

        return await prisma.cartitem.update(
            where={"id": item_id},
            data={"quantity": quantity}
        )

    async def delete_item(self, item_id: int, user_id: int):
        await self._assert_item_access(item_id, user_id)
        return await prisma.cartitem.delete(where={"id": item_id})

    async def clear_cart(self, cart_id: int, user_id: int):
        cart = await prisma.cart.find_unique(where={"id": cart_id})
        if not cart:
            raise HTTPException(404, "Cart not found")
        if cart.userId != user_id:
            raise HTTPException(403, "Forbidden")

        await prisma.cartitem.delete_many(
            where={"cartId": cart_id}
        )
        return {"message": "Cart cleared"}

    # 🔥 FIX QUAN TRỌNG
    def _attach_total(self, cart):
        total = 0

        for item in cart.items:
            price = 0

            if item.variant:
                price = item.variant.price
            elif item.product:
                price = item.product.price

            total += price * item.quantity



        cart_dict = cart.model_dump()
        cart_dict["totalAmount"] = total

        return cart_dict
