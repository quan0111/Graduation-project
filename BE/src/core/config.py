from pydantic_settings import BaseSettings, SettingsConfigDict   # ← import SettingsConfigDict từ đây
from functools import lru_cache
from typing import List, Optional


class Settings(BaseSettings):
    APP_NAME: str = "DATN E-commerce API"
    DEBUG: bool = True
    DATABASE_URL: str 

    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: Optional[str] = None
    OLLAMA_TIMEOUT_SECONDS: int = 45
    MOMO_ENDPOINT: str = "https://test-payment.momo.vn/v2/gateway/api/create"
    MOMO_PARTNER_CODE: str = ""
    MOMO_ACCESS_KEY: str = ""
    MOMO_SECRET_KEY: str = ""
    MOMO_REDIRECT_URL: str = ""
    MOMO_IPN_URL: str = ""
    VNPAY_TMN_CODE: str = ""
    VNPAY_HASH_SECRET_KEY: str = ""
    VNPAY_RETURN_URL: str = ""
    VNPAY_PAYMENT_URL: str = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
    VNPAY_API_URL: str = "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = True
    CACHE_ENABLED: bool = True
    COOKIE_SECURE: Optional[bool] = None
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    model_config = SettingsConfigDict(          # ← dùng SettingsConfigDict
        env_file=".env",
        env_file_encoding="utf-8",              # khuyến nghị thêm
        extra="ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()          # instance để dùng trong app
