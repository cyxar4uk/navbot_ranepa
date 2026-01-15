from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "NavBot RANEPA"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/navbot"
    DATABASE_ECHO: bool = False
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBAPP_URL: str = ""
    
    # LLM
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    AGENT_CONFIG_PATH: Optional[str] = None
    
    # Redis (for caching)
    REDIS_URL: Optional[str] = None

    # Admin panel (browser) login
    # В production обязательно установить через переменные окружения!
    ADMIN_USERNAME: str = "admin"  # ВАЖНО: Измените в production!
    ADMIN_PASSWORD: str = "admin"  # ВАЖНО: Измените в production!
    ADMIN_TOKEN_EXPIRE_MINUTES: int = 120
    
    # Security
    # В production обязательно установить через переменные окружения!
    SECRET_KEY: str = "your-secret-key-change-in-production"  # ВАЖНО: Измените в production!
    
    # CORS
    # В production укажите конкретные домены вместо "*"
    CORS_ORIGINS: list[str] = ["*"]  # ВАЖНО: Ограничьте в production!
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
