import unittest

from src.core.security import (
    AUTH_SCOPE_ADMIN,
    AUTH_SCOPE_STOREFRONT,
    create_access_token,
    decode_token,
    verify_token_type,
)


class AuthSecurityTest(unittest.TestCase):
    def test_access_token_scope_is_enforced(self):
        token = create_access_token({"sub": "1"}, scope=AUTH_SCOPE_ADMIN)
        payload = decode_token(token)

        self.assertTrue(verify_token_type(payload, "access", AUTH_SCOPE_ADMIN))
        self.assertFalse(verify_token_type(payload, "access", AUTH_SCOPE_STOREFRONT))
        self.assertFalse(verify_token_type(payload, "refresh", AUTH_SCOPE_ADMIN))


if __name__ == "__main__":
    unittest.main()
