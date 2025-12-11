"""
Configuration settings for RabbitCTF.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # App Info
    APP_NAME: str = "RabbitCTF API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+psycopg://rabbitctf:rabbitctf@db:5432/rabbitctf"

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production-min-32-chars-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    # Allow all origins by default to avoid CORS issues in deployment
    BACKEND_CORS_ORIGINS: list = ["*"]

    # Password Hashing
    PWD_CONTEXT_SCHEMES: list = ["bcrypt"]
    PWD_CONTEXT_DEPRECATED: str = "auto"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
