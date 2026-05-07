import unittest
from types import SimpleNamespace

from fastapi import HTTPException

from src.modules.order.order_service import OrderService, SELLER_TRANSITIONS


class CheckoutLifecycleTest(unittest.IsolatedAsyncioTestCase):
    async def test_checkout_rejects_user_id_spoofing(self):
        current_user = SimpleNamespace(id=1)
        order_data = SimpleNamespace(userId=2)

        with self.assertRaises(HTTPException) as exc:
            await OrderService.create_order(current_user, order_data)

        self.assertEqual(exc.exception.status_code, 403)

    def test_seller_lifecycle_transition_is_sequential(self):
        OrderService._assert_transition("PAID", "PROCESSING", SELLER_TRANSITIONS)

        with self.assertRaises(HTTPException) as exc:
            OrderService._assert_transition("PENDING", "SHIPPED", SELLER_TRANSITIONS)

        self.assertEqual(exc.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
