from pydantic_settings import BaseSettings, SettingsConfigDict   # ← import SettingsConfigDict từ đây
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "DATN E-commerce API"
    DEBUG: bool = True
    DATABASE_URL: str 

    SECRET_KEY: str 
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: Optional[str] = None
    OLLAMA_TIMEOUT_SECONDS: int = 25

    model_config = SettingsConfigDict(          # ← dùng SettingsConfigDict
        env_file=".env",
        env_file_encoding="utf-8",              # khuyến nghị thêm
        extra="ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()          # instance để dùng trong app
