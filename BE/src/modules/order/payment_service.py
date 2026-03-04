from fastapi import HTTPException
from src.core.database import Prisma
from src.modules.order.order_schema import PaymentCreate, PaymentOut
from datetime import datetime
class PaymentService:
    @staticmethod
    async def create_payment(payment_data: PaymentCreate) -> PaymentOut:
        payment = await Prisma.payment.create(
            data={
                "orderId": payment_data.orderId,
                "method": payment_data.method,
                "status": "pending",
                "createdAt": datetime.utcnow()
            }
        )
        return PaymentOut.from_orm(payment)
    @staticmethod
    async def get_payment(payment_id: int) -> PaymentOut:
        payment = await Prisma.payment.find_unique(where={"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return PaymentOut.from_orm(payment)
    @staticmethod
    async def update_payment_status(payment_id: int, status: str) -> PaymentOut:
        payment = await Prisma.payment.update(
            where={"id": payment_id},
            data={"status": status}
        )
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return PaymentOut.from_orm(payment)
    @staticmethod
    async def delete_payment(payment_id: int):
        payment = await Prisma.payment.delete(where={"id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return {"message": "Payment deleted successfully"}
    @staticmethod
    async def get_payments_by_order(order_id: int) -> list[PaymentOut]:
        payments = await Prisma.payment.find_many(where={"orderId": order_id})
        return [PaymentOut.from_orm(payment) for payment in payments]
    @staticmethod
    async def get_all_payments() -> list[PaymentOut]:
        payments = await Prisma.payment.find_many()
        return [PaymentOut.from_orm(payment) for payment in payments]
    @staticmethod
    async def get_payments_by_status(status: str) -> list[PaymentOut]:
        payments = await Prisma.payment.find_many(where={"status": status})
        return [PaymentOut.from_orm(payment) for payment in payments]
    @staticmethod
    async def get_payments_by_method(method: str) -> list[PaymentOut]:
        payments = await Prisma.payment.find_many(where={"method": method})
        return [PaymentOut.from_orm(payment) for payment in payments]