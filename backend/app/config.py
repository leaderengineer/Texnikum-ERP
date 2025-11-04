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
    
    # JSHSHIR API integratsiyasi
    JSHSHIR_API_ENABLED: bool = False  # Haqiqiy API'ni yoqish uchun True qiling
    JSHSHIR_API_URL: str = "https://api.fuqarolik.uz/v1"  # API base URL
    JSHSHIR_API_KEY: str = ""  # API kalit (agar kerak bo'lsa)
    JSHSHIR_API_TIMEOUT: int = 10  # So'rov timeout (sekundlarda)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

