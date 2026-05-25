import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from src.modules.order import payment_service
from src.modules.order.payment_service import PaymentService


class PaymentCallbackTest(unittest.IsolatedAsyncioTestCase):
    async def test_success_callback_moves_pending_order_to_paid(self):
        original_prisma = payment_service.prisma
        fake_order = SimpleNamespace(status="PENDING")
        fake_order_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=fake_order),
            update=AsyncMock(),
        )
        fake_package_model = SimpleNamespace(update_many=AsyncMock())
        payment_service.prisma = SimpleNamespace(order=fake_order_model, ordershoppackage=fake_package_model)

        try:
            await PaymentService._sync_order_payment_status(10, "SUCCESS")
        finally:
            payment_service.prisma = original_prisma

        fake_order_model.update.assert_awaited_once_with(
            where={"id": 10},
            data={"status": "PAID"},
        )
        fake_package_model.update_many.assert_awaited_once()

    async def test_failed_callback_does_not_regress_paid_order(self):
        original_prisma = payment_service.prisma
        fake_order = SimpleNamespace(status="PAID")
        fake_order_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=fake_order),
            update=AsyncMock(),
        )
        fake_package_model = SimpleNamespace(update_many=AsyncMock())
        payment_service.prisma = SimpleNamespace(order=fake_order_model, ordershoppackage=fake_package_model)

        try:
            await PaymentService._sync_order_payment_status(10, "FAILED")
        finally:
            payment_service.prisma = original_prisma

        fake_order_model.update.assert_not_awaited()
        fake_package_model.update_many.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
