import unittest
from datetime import datetime, timedelta
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
        original_clear_cart = PaymentService._clear_paid_order_cart_items
        original_notify = PaymentService._notify_order_visible
        fake_order = SimpleNamespace(id=10, status="PENDING", checkoutGroupCode=None)
        fake_order_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=fake_order),
            update_many=AsyncMock(return_value=1),
        )
        fake_package_model = SimpleNamespace(update_many=AsyncMock())
        fake_payment_model = SimpleNamespace(update_many=AsyncMock())
        payment_service.prisma = SimpleNamespace(
            order=fake_order_model,
            ordershoppackage=fake_package_model,
            payment=fake_payment_model,
        )
        PaymentService._clear_paid_order_cart_items = AsyncMock()
        PaymentService._notify_order_visible = AsyncMock()

        try:
            await PaymentService._sync_order_payment_status(10, "SUCCESS")
        finally:
            payment_service.prisma = original_prisma
            PaymentService._clear_paid_order_cart_items = original_clear_cart
            PaymentService._notify_order_visible = original_notify

        fake_order_model.update_many.assert_awaited_once_with(
            where={
                "id": {"in": [10]},
                "status": {"in": ["PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]},
            },
            data={"status": "PAID"},
        )
        fake_payment_model.update_many.assert_awaited_once()
        fake_package_model.update_many.assert_awaited_once()

    async def test_failed_callback_does_not_regress_paid_order(self):
        original_prisma = payment_service.prisma
        fake_order = SimpleNamespace(id=10, status="PAID", checkoutGroupCode=None)
        fake_order_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=fake_order),
            update_many=AsyncMock(),
        )
        fake_package_model = SimpleNamespace(update_many=AsyncMock())
        payment_service.prisma = SimpleNamespace(
            order=fake_order_model,
            ordershoppackage=fake_package_model,
            payment=SimpleNamespace(update_many=AsyncMock()),
        )

        try:
            await PaymentService._sync_order_payment_status(10, "FAILED")
        finally:
            payment_service.prisma = original_prisma

        fake_order_model.update_many.assert_not_awaited()
        fake_package_model.update_many.assert_not_awaited()

    async def test_success_callback_moves_checkout_group_to_paid_once(self):
        original_prisma = payment_service.prisma
        original_clear_cart = PaymentService._clear_paid_order_cart_items
        original_notify_group = PaymentService._notify_payment_group_visible

        primary_order = SimpleNamespace(id=10, status="PENDING_PAYMENT", checkoutGroupCode="CHK-1", userId=5)
        child_order = SimpleNamespace(id=11, status="PENDING_PAYMENT", checkoutGroupCode="CHK-1", userId=5)
        fake_order_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=primary_order),
            find_many=AsyncMock(return_value=[primary_order, child_order]),
            update_many=AsyncMock(return_value=2),
        )
        fake_payment_model = SimpleNamespace(update_many=AsyncMock())
        fake_package_model = SimpleNamespace(update_many=AsyncMock())
        payment_service.prisma = SimpleNamespace(
            order=fake_order_model,
            payment=fake_payment_model,
            ordershoppackage=fake_package_model,
        )
        clear_cart_mock = AsyncMock()
        notify_group_mock = AsyncMock()
        PaymentService._clear_paid_order_cart_items = clear_cart_mock
        PaymentService._notify_payment_group_visible = notify_group_mock

        try:
            await PaymentService._sync_order_payment_status(10, "SUCCESS")
        finally:
            payment_service.prisma = original_prisma
            PaymentService._clear_paid_order_cart_items = original_clear_cart
            PaymentService._notify_payment_group_visible = original_notify_group

        fake_order_model.update_many.assert_awaited_once_with(
            where={
                "id": {"in": [10, 11]},
                "status": {"in": ["PENDING", "PENDING_PAYMENT", "PAYMENT_FAILED", "PAYMENT_EXPIRED"]},
            },
            data={"status": "PAID"},
        )
        fake_payment_model.update_many.assert_awaited_once()
        fake_package_model.update_many.assert_awaited_once()
        clear_cart_mock.assert_awaited_once_with(10)
        notify_group_mock.assert_awaited_once_with([10, 11], "PAID")

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

    async def test_release_payment_hold_restores_stock_flash_sale_and_coupon(self):
        order_id = 10
        item = SimpleNamespace(
            id=51,
            shopId=3,
            productId=7,
            variantId=11,
            quantity=2,
            price=99000,
            productName="Sneaker",
        )
        order = SimpleNamespace(
            id=order_id,
            userId=5,
            createdAt=datetime.utcnow(),
            items=[item],
        )
        variant = SimpleNamespace(id=11, stock=4)
        client = SimpleNamespace(
            order=SimpleNamespace(find_unique=AsyncMock(return_value=order)),
            productvariant=SimpleNamespace(
                find_unique=AsyncMock(return_value=variant),
                update=AsyncMock(),
            ),
            inventoryledger=SimpleNamespace(create=AsyncMock()),
            flashsale=SimpleNamespace(find_many=AsyncMock(return_value=[SimpleNamespace(id=21)])),
            flashsaleitem=SimpleNamespace(
                find_first=AsyncMock(return_value=SimpleNamespace(id=31)),
                update_many=AsyncMock(),
            ),
            couponredemption=SimpleNamespace(
                find_many=AsyncMock(return_value=[SimpleNamespace(couponId=41)]),
                delete_many=AsyncMock(),
            ),
            coupon=SimpleNamespace(update_many=AsyncMock()),
        )

        await PaymentService._release_order_reservation(client, order_id)

        client.productvariant.update.assert_awaited_once_with(
            where={"id": 11},
            data={"stock": 6},
        )
        ledger_payload = client.inventoryledger.create.await_args.kwargs["data"]
        self.assertEqual(ledger_payload["type"], "PAYMENT_RELEASE")
        self.assertEqual(ledger_payload["quantityChange"], 2)
        self.assertEqual(ledger_payload["stockBefore"], 4)
        self.assertEqual(ledger_payload["stockAfter"], 6)
        client.flashsaleitem.update_many.assert_awaited_once_with(
            where={"id": 31, "soldCount": {"gte": 2}},
            data={"soldCount": {"decrement": 2}},
        )
        client.coupon.update_many.assert_awaited_once_with(
            where={"id": 41, "usedCount": {"gt": 0}},
            data={"usedCount": {"decrement": 1}},
        )
        client.couponredemption.delete_many.assert_awaited_once_with(where={"orderId": order_id})

    async def test_stale_payment_hold_is_expired_by_backend_cleanup(self):
        original_prisma = payment_service.prisma
        original_sync_order = PaymentService._sync_order_payment_status
        original_create_event = PaymentService._create_event

        created_at = datetime.utcnow() - timedelta(minutes=20)
        order = SimpleNamespace(id=10, status="PENDING_PAYMENT", createdAt=created_at, deletedAt=None)
        pending_payment = SimpleNamespace(
            id=1,
            orderId=10,
            method="MOMO",
            status="PENDING",
        )
        order.payment = pending_payment
        expired_payment = SimpleNamespace(
            id=1,
            orderId=10,
            method="MOMO",
            status="PAYMENT_EXPIRED",
            providerOrderId="ORDER-10",
            requestId="REQ-1",
            transactionId=None,
        )
        payment_model = SimpleNamespace(
            find_unique=AsyncMock(return_value=expired_payment),
            update_many=AsyncMock(return_value=1),
        )
        order_model = SimpleNamespace(
            find_many=AsyncMock(return_value=[order]),
            find_unique=AsyncMock(return_value=order),
        )
        payment_service.prisma = SimpleNamespace(order=order_model, payment=payment_model)
        sync_order_mock = AsyncMock()
        create_event_mock = AsyncMock()
        PaymentService._sync_order_payment_status = sync_order_mock
        PaymentService._create_event = create_event_mock

        try:
            result = await PaymentService.expire_stale_payment_holds(max_age_minutes=15)
        finally:
            payment_service.prisma = original_prisma
            PaymentService._sync_order_payment_status = original_sync_order
            PaymentService._create_event = original_create_event

        self.assertEqual(result["expired"], 1)
        order_model.find_many.assert_awaited_once()
        order_model.find_unique.assert_awaited_once_with(
            where={"id": 10},
            include={"payment": True},
        )
        payment_model.update_many.assert_awaited_once()
        sync_order_mock.assert_awaited_once_with(10, "PAYMENT_EXPIRED")
        create_event_mock.assert_awaited_once()


if __name__ == "__main__":
    unittest.main()
