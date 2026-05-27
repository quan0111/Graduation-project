import unittest

from src.modules.chatbot.chatbot_service import ChatService


class ChatbotCaseTests(unittest.TestCase):
    def test_detects_new_ecommerce_cases(self):
        cases = {
            "tôi muốn hủy đơn này": "order_cancel",
            "đã nhận được hàng thì đánh giá ở đâu": "review",
            "mã vận đơn xem ở đâu": "tracking",
            "flash sale hết suất thì sao": "flash_sale",
            "sản phẩm yêu thích của tôi": "wishlist",
            "variant hết hàng có chọn được không": "stock",
        }

        for message, expected_intent in cases.items():
            with self.subTest(message=message):
                self.assertEqual(ChatService._detect_intent(ChatService._normalize(message)), expected_intent)

    def test_new_fallbacks_are_user_facing(self):
        for intent in ["order_cancel", "review", "tracking", "flash_sale", "wishlist", "stock"]:
            with self.subTest(intent=intent):
                answer = ChatService._fallback_answer(intent, {"context_lines": [], "products": []}, "fallback")
                self.assertNotIn("Ollama", answer)
                self.assertGreater(len(answer), 20)

    def test_return_intent_wins_when_message_mentions_received_item(self):
        message = "đã nhận hàng nhưng bị lỗi muốn trả hàng"
        self.assertEqual(ChatService._detect_intent(ChatService._normalize(message)), "return_policy")

    def test_naturalize_removes_source_line(self):
        answer = ChatService._naturalize_answer("Theo context, bạn xem chi tiết đơn nhé.\n\nNguon: [K1]")
        self.assertEqual(answer, "bạn xem chi tiết đơn nhé.")


if __name__ == "__main__":
    unittest.main()
