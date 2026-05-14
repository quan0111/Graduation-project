import asyncio
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from src.core.database import prisma
from src.core.security import hash_password


DEMO_PASSWORD = "Demo@123"


async def upsert_user(email: str, role: str, full_name: str):
    existing = await prisma.user.find_unique(where={"email": email})
    if existing:
        return existing
    return await prisma.user.create(
        data={
            "email": email,
            "password": hash_password(DEMO_PASSWORD),
            "fullName": full_name,
            "phone": "0900000000",
            "role": role,
            "isActive": True,
        }
    )


async def main():
    await prisma.connect()
    try:
        admin = await upsert_user("admin.demo@markethub.vn", "ADMIN", "Admin Demo")
        seller = await upsert_user("seller.demo@markethub.vn", "SELLER", "Seller Demo")
        customer = await upsert_user("customer.demo@markethub.vn", "CUSTOMER", "Customer Demo")

        shop = await prisma.shop.find_first(where={"ownerId": seller.id})
        if not shop:
            shop = await prisma.shop.create(
                data={
                    "name": "TechMall Demo",
                    "slug": "techmall-demo",
                    "description": "Shop demo cho hội đồng chấm thử luồng seller.",
                    "ownerId": seller.id,
                    "isActive": True,
                }
            )

        category = await prisma.category.find_first(where={"slug": "demo-electronics"})
        if not category:
            category = await prisma.category.create(data={"name": "Demo Electronics", "slug": "demo-electronics"})

        product = await prisma.product.find_first(where={"slug": "demo-keyboard"})
        if not product:
            product = await prisma.product.create(
                data={
                    "name": "Bàn phím cơ Demo K1",
                    "slug": "demo-keyboard",
                    "description": "Sản phẩm demo có tồn kho, ảnh, đơn hàng và báo cáo.",
                    "price": 890000,
                    "status": "ACTIVE",
                    "shop": {"connect": {"id": shop.id}},
                    "category": {"connect": {"id": category.id}},
                    "images": {"create": [{"url": "https://placehold.co/800x800/orange/white?text=Demo+Keyboard", "isPrimary": True}]},
                    "variants": {"create": [{"name": "Switch Brown", "sku": "DEMO-K1-BROWN", "stock": 50, "price": 890000}]},
                }
            )
        product_with_variant = await prisma.product.find_unique(where={"id": product.id}, include={"variants": True})
        variant = product_with_variant.variants[0]

        address = await prisma.address.find_first(where={"userId": customer.id})
        if not address:
            address = await prisma.address.create(
                data={
                    "userId": customer.id,
                    "fullName": "Customer Demo",
                    "phone": "0900000000",
                    "addressLine": "1 Demo Street",
                    "district": "Quận 1",
                    "province": "TP. Hồ Chí Minh",
                    "isDefault": True,
                }
            )

        order = await prisma.order.find_first(where={"userId": customer.id, "items": {"some": {"productId": product.id}}})
        if not order:
            order = await prisma.order.create(
                data={
                    "userId": customer.id,
                    "status": "COMPLETED",
                    "subtotal": 890000,
                    "shippingFee": 25000,
                    "discountAmount": 0,
                    "totalAmount": 915000,
                    "shippingAddressId": address.id,
                    "createdAt": datetime.utcnow() - timedelta(days=2),
                    "items": {
                        "create": [
                            {
                                "shopId": shop.id,
                                "productId": product.id,
                                "variantId": variant.id,
                                "quantity": 1,
                                "price": 890000,
                                "productName": product.name,
                                "variantName": variant.name,
                                "productImage": "https://placehold.co/800x800/orange/white?text=Demo+Keyboard",
                            }
                        ]
                    },
                    "payment": {"create": {"method": "VNPAY", "status": "SUCCESS", "amount": 915000, "paidAt": datetime.utcnow() - timedelta(days=2)}},
                }
            )

        ticket = await prisma.supportticket.find_first(where={"userId": customer.id, "subject": "Demo ticket hỗ trợ"})
        if not ticket:
            await prisma.supportticket.create(
                data={
                    "userId": customer.id,
                    "shopId": shop.id,
                    "orderId": order.id,
                    "subject": "Demo ticket hỗ trợ",
                    "category": "ORDER",
                    "priority": "MEDIUM",
                    "status": "OPEN",
                    "messages": {"create": [{"senderId": customer.id, "senderRole": "CUSTOMER", "message": "Tôi cần hỗ trợ kiểm tra đơn demo."}]},
                }
            )

        print("Demo accounts ready:")
        print(f"  admin.demo@markethub.vn / {DEMO_PASSWORD}")
        print(f"  seller.demo@markethub.vn / {DEMO_PASSWORD}")
        print(f"  customer.demo@markethub.vn / {DEMO_PASSWORD}")
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
