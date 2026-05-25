import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from src.modules.order import payment_service
from src.modules.order.payment_service import PaymentService


class AsyncTx:
    def __init__(self, client):
        self.client = client

    async def __aenter__(self):
        return self.client

    async def __aexit__(self, exc_type, exc, tb):
        return False


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

    async def test_duplicate_gateway_callback_does_not_emit_side_effects(self):
        original_prisma = payment_service.prisma
        original_sync_order = PaymentService._sync_order_payment_status
        original_create_event = PaymentService._create_event
        original_notify = PaymentService._notify_payment_update

        pending_payment = SimpleNamespace(
            id=1,
            orderId=10,
            status="PENDING",
            amount=100000,
            method="MOMO",
            providerOrderId="ORDER-10",
            requestId="REQ-1",
            transactionId=None,
        )
        already_updated_payment = SimpleNamespace(
            **{
                **pending_payment.__dict__,
                "status": "SUCCESS",
                "transactionId": "TX-1",
            }
        )
        tx_client = SimpleNamespace(
            payment=SimpleNamespace(
                update_many=AsyncMock(return_value=0),
                find_unique=AsyncMock(return_value=already_updated_payment),
            )
        )
        payment_service.prisma = SimpleNamespace(
            payment=SimpleNamespace(find_unique=AsyncMock(return_value=pending_payment)),
            tx=lambda: AsyncTx(tx_client),
        )
        sync_order_mock = AsyncMock()
        create_event_mock = AsyncMock()
        notify_mock = AsyncMock()
        PaymentService._sync_order_payment_status = sync_order_mock
        PaymentService._create_event = create_event_mock
        PaymentService._notify_payment_update = notify_mock

        try:
            result = await PaymentService._update_gateway_callback(
                provider_order_id="ORDER-10",
                status="SUCCESS",
                callback_data={"amount": 100000},
                transaction_id="TX-1",
                provider_message="Success",
            )
        finally:
            payment_service.prisma = original_prisma
            PaymentService._sync_order_payment_status = original_sync_order
            PaymentService._create_event = original_create_event
            PaymentService._notify_payment_update = original_notify

        self.assertEqual(result.status, "SUCCESS")
        tx_client.payment.update_many.assert_awaited_once()
        sync_order_mock.assert_not_awaited()
        create_event_mock.assert_not_awaited()
        notify_mock.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
