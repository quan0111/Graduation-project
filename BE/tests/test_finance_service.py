import unittest

from fastapi import HTTPException

from src.modules.finance.finance_service import FinanceService


class FinanceServiceTest(unittest.TestCase):
    def test_default_commission_rate_uses_order_value_tiers(self):
        self.assertEqual(FinanceService._default_commission_rate_for_amount(120_000), 0.07)
        self.assertEqual(FinanceService._default_commission_rate_for_amount(650_000), 0.06)
        self.assertEqual(FinanceService._default_commission_rate_for_amount(1_500_000), 0.05)
        self.assertEqual(FinanceService._default_commission_rate_for_amount(2_500_000), 0.04)
        self.assertEqual(FinanceService._default_commission_rate_for_amount(5_500_000), 0.03)

    def test_commission_rate_is_clamped_to_platform_range(self):
        self.assertEqual(FinanceService._normalize_commission_rate(0.01), 0.03)
        self.assertEqual(FinanceService._normalize_commission_rate(0.1), 0.07)
        self.assertEqual(FinanceService._normalize_commission_rate(0.05), 0.05)

    def test_admin_config_rate_must_be_three_to_seven_percent(self):
        with self.assertRaises(HTTPException):
            FinanceService._assert_valid_commission_rate(0.1)
        with self.assertRaises(HTTPException):
            FinanceService._assert_valid_commission_rate(0.02)

        FinanceService._assert_valid_commission_rate(0.03)
        FinanceService._assert_valid_commission_rate(0.07)


if __name__ == "__main__":
    unittest.main()
