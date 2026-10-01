from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    APP_ENV: str = "development"
    API_PORT: int = 8000
    DEMO_DATE: str = "2026-10-01"
    CURRENCY: str = "EUR"

    # Security
    JWT_SECRET: str = "supplypilot-super-secret-jwt-key-minimum-32-bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./supplypilot.db"

    # Vector Store (Qdrant)
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_COLLECTION_NAME: str = "supplypilot_policies"

    # LLM Settings
    LLM_PROVIDER: str = "deepseek"  # "deepseek" | "openai" | "mock"
    LLM_MODEL: str = "deepseek-chat"
    DEEPSEEK_API_KEY: Optional[str] = None

    # Jev Probabilistic Decision Support
    JEV_ENABLED: bool = False
    JEV_MODEL: str = "typesafe-ai/jev"
    AI_GATEWAY_API_KEY: Optional[str] = None
    AI_GATEWAY_URL: str = "https://ai-gateway.vercel.sh/v1"

    # Approval Thresholds (in EUR)
    THRESHOLD_AUTO_EXECUTE_MAX: float = 5000.0
    THRESHOLD_PROCUREMENT_MAX: float = 25000.0

    @property
    def cors_origin_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return ["*"]

    @property
    def is_postgres(self) -> bool:
        return "postgres" in self.DATABASE_URL.lower()


settings = Settings()
