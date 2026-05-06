from fastapi import HTTPException
from src.core.database import prisma
from src.modules.order.order_schema import PaymentCreate, PaymentOut
class PaymentService:
    @staticmethod
    async def create_payment(payment_data: PaymentCreate) -> PaymentOut:

        order = await prisma.order.find_unique(
            where={"id": payment_data.orderId}
        )
        if not order:
            raise HTTPException(404, "Order not found")

        existing = await prisma.payment.find_unique(
            where={"orderId": payment_data.orderId}
        )
        if existing:
            raise HTTPException(400, "Payment already exists for this order")

        payment = await prisma.payment.create(
            data={
                "order": {"connect": {"id": payment_data.orderId}},
                "method": payment_data.method,
                "status": "PENDING"
            }
        )

        return PaymentOut.from_orm(payment)

    @staticmethod
    async def get_payment(payment_id: int) -> PaymentOut:
        payment = await prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        return PaymentOut.from_orm(payment)

    @staticmethod
    async def update_payment_status(payment_id: int, status: str) -> PaymentOut:

        payment = await prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(404, "Payment not found")

        updated = await prisma.payment.update(
            where={"id": payment_id},
            data={"status": status}
        )
        if status == "SUCCESS":
            await prisma.order.update(
                where={"id": payment.orderId},
                data={"status": "PAID"}
            )

        if status == "FAILED":
            await prisma.order.update(
                where={"id": payment.orderId},
                data={"status": "PAYMENT_FAILED"}
            )

        return PaymentOut.from_orm(updated)

    @staticmethod
    async def get_payment_by_order(order_id: int) -> PaymentOut:
        payment = await prisma.payment.find_unique(
            where={"orderId": order_id}
        )

        if not payment:
            raise HTTPException(404, "Payment not found")

        return PaymentOut.from_orm(payment)


    @staticmethod
    async def get_all_payments() -> list[PaymentOut]:
        payments = await prisma.payment.find_many()
        return [PaymentOut.from_orm(p) for p in payments]

    @staticmethod
    async def get_payments_by_status(status: str) -> list[PaymentOut]:
        payments = await prisma.payment.find_many(where={"status": status})
        return [PaymentOut.from_orm(p) for p in payments]

    @staticmethod
    async def get_payments_by_method(method: str) -> list[PaymentOut]:
        payments = await prisma.payment.find_many(where={"method": method})
        return [PaymentOut.from_orm(p) for p in payments]

