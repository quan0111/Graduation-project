import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from fastapi import HTTPException

from src.modules.return_request import return_service
from src.modules.return_request.return_service import ReturnService


class AsyncTx:
    def __init__(self, client):
        self.client = client

    async def __aenter__(self):
        return self.client

    async def __aexit__(self, exc_type, exc, tb):
        return False


class ReturnRefundTest(unittest.IsolatedAsyncioTestCase):
    async def test_return_request_requires_items(self):
        data = SimpleNamespace(items=[])

        with self.assertRaises(HTTPException) as exc:
            await ReturnService.create_request(1, data)

        self.assertEqual(exc.exception.status_code, 400)

    async def test_seller_refund_requires_admin_approval(self):
        original_prisma = return_service.prisma
        original_get_shop = ReturnService._get_seller_shop
        tx_client = SimpleNamespace(
            returnrequest=SimpleNamespace(
                find_unique=AsyncMock(
                    return_value=SimpleNamespace(status="REQUESTED", items=[])
                )
            )
        )
        return_service.prisma = SimpleNamespace(tx=lambda: AsyncTx(tx_client))
        ReturnService._get_seller_shop = AsyncMock(return_value=SimpleNamespace(id=7))

        try:
            with self.assertRaises(HTTPException) as exc:
                await ReturnService.mark_refunded(99, 12)
        finally:
            return_service.prisma = original_prisma
            ReturnService._get_seller_shop = original_get_shop

        self.assertEqual(exc.exception.status_code, 400)
        self.assertIn("Admin must approve", exc.exception.detail)


if __name__ == "__main__":
    unittest.main()
