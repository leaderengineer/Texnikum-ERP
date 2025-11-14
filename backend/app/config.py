from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database (Railway PostgreSQL uchun)
    DATABASE_URL: str = "sqlite:///./texnikum_erp.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        # Production - Vercel frontend URL'larini qo'shing
        # Masalan: "https://your-app-name.vercel.app"
    ]
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database Connection Pool Settings (PostgreSQL uchun)
    DB_POOL_SIZE: int = 20  # Asosiy connection pool hajmi
    DB_MAX_OVERFLOW: int = 40  # Qo'shimcha connectionlar
    DB_POOL_RECYCLE: int = 3600  # Connection recycle vaqti (sekundlarda)
    
    # Performance Settings
    API_RATE_LIMIT_PER_MINUTE: int = 100  # Har bir IP uchun daqiqada so'rovlar soni
    CACHE_TTL_SECONDS: int = 300  # Cache TTL (5 daqiqa)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

