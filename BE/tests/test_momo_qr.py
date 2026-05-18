import base64
import unittest

from src.modules.order.momo_service import MoMoService


class MoMoQrTest(unittest.TestCase):
    def test_create_qr_code_data_uri_returns_png_data_url(self):
        data_uri = MoMoService.create_qr_code_data_uri("momo://pay?orderId=ORDER-1")

        self.assertTrue(data_uri.startswith("data:image/png;base64,"))
        encoded = data_uri.split(",", 1)[1]
        self.assertTrue(base64.b64decode(encoded).startswith(b"\x89PNG"))


if __name__ == "__main__":
    unittest.main()
