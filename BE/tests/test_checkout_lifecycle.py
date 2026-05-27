import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from src.modules.order.order_service import ADMIN_TRANSITIONS, OrderService, SELLER_TRANSITIONS
from src.modules.product.service.product import ProductService


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

    def test_admin_cannot_operate_seller_shipping_flow(self):
        with self.assertRaises(HTTPException) as exc:
            OrderService._assert_transition("PAID", "SHIPPED", ADMIN_TRANSITIONS)

        self.assertEqual(exc.exception.status_code, 400)

    def test_product_requires_variant_for_stock_tracking(self):
        product_data = SimpleNamespace(
            variants=[],
            name="No variant",
            description=None,
            slug=None,
            images=[],
            attributes=[],
            tags=[],
            categoryId=1,
            price=1000,
        )

        with self.assertRaises(HTTPException) as exc:
            ProductService._build_product_payload(product_data, shop_id=1, status="DRAFT")

        self.assertEqual(exc.exception.status_code, 400)

    async def test_coupon_limit_update_is_atomic(self):
        client = SimpleNamespace(
            coupon=SimpleNamespace(update_many=AsyncMock(return_value=0)),
            couponredemption=SimpleNamespace(create=AsyncMock()),
        )

        with self.assertRaises(HTTPException) as exc:
            await OrderService._apply_coupon_redemptions(
                client,
                {"appliedCoupons": [{"id": 1, "usageLimit": 5}]},
                order_id=10,
                user_id=20,
            )

        self.assertEqual(exc.exception.status_code, 400)
        client.couponredemption.create.assert_not_awaited()

    async def test_customer_must_confirm_multi_shop_packages_separately(self):
        current_user = SimpleNamespace(id=1)
        order = SimpleNamespace(
            userId=1,
            status="DELIVERED",
            packages=[SimpleNamespace(id=1), SimpleNamespace(id=2)],
            payment=None,
        )
        order_data = SimpleNamespace(
            model_dump=lambda exclude_unset=True: {"status": "COMPLETED"},
        )

        with (
            patch("src.modules.order.order_service.get_role_value", return_value="CUSTOMER"),
            patch.object(OrderService, "assert_order_visibility", AsyncMock(return_value=order)),
        ):
            with self.assertRaises(HTTPException) as exc:
                await OrderService.update_order(10, current_user, order_data)

        self.assertEqual(exc.exception.status_code, 400)
        self.assertIn("từng shop", exc.exception.detail)

    async def test_flash_sale_quota_update_is_atomic(self):
        client = SimpleNamespace(
            flashsaleitem=SimpleNamespace(update_many=AsyncMock(return_value=0)),
        )

        with self.assertRaises(HTTPException) as exc:
            await OrderService._apply_flash_sale_sales(
                client,
                [{"id": 1, "quantity": 2, "stockLimit": 10}],
            )

        self.assertEqual(exc.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
