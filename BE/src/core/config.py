from pydantic_settings import BaseSettings, SettingsConfigDict   # ← import SettingsConfigDict từ đây
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "DATN E-commerce API"
    DEBUG: bool = True
    DATABASE_URL: str 

    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    model_config = SettingsConfigDict(          # ← dùng SettingsConfigDict
        env_file=".env",
        env_file_encoding="utf-8",              # khuyến nghị thêm
        extra="ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()          # instance để dùng trong app