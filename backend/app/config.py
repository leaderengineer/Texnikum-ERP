from pydantic_settings import BaseSettings
from typing import List, Union
import os


class Settings(BaseSettings):
    # Database (Railway PostgreSQL uchun)
    DATABASE_URL: str = "sqlite:///./texnikum_erp.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS - string yoki list sifatida qabul qilish
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        # Production - Vercel frontend URL'larini qo'shing
        # Masalan: "https://your-app-name.vercel.app"
    ]
    
    def get_cors_origins(self) -> List[str]:
        """CORS origins'ni list sifatida qaytarish"""
        default_origins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
        ]
        
        try:
            if isinstance(self.CORS_ORIGINS, str):
                # Agar string bo'lsa, vergul bilan ajratilgan list'ga o'tkazish
                origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
                return origins if origins else default_origins
            elif isinstance(self.CORS_ORIGINS, list):
                return self.CORS_ORIGINS if self.CORS_ORIGINS else default_origins
            else:
                return default_origins
        except Exception:
            return default_origins
    
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
    
    # Email Settings
    EMAIL_ENABLED: bool = True  # Email yoqilgan/yochilgan
    EMAIL_SMTP_HOST: str = "smtp.gmail.com"  # SMTP server (masalan: smtp.gmail.com)
    EMAIL_SMTP_PORT: int = 587  # SMTP port (masalan: 587 yoki 465)
    EMAIL_SMTP_USE_TLS: bool = True  # TLS ishlatish
    EMAIL_SMTP_USERNAME: str = ""  # SMTP username (masalan: your-email@gmail.com)
    EMAIL_SMTP_PASSWORD: str = ""  # SMTP password (Gmail uchun App Password)
    EMAIL_FROM: str = ""  # Yuboruvchi email (EMAIL_SMTP_USERNAME bilan bir xil bo'lishi kerak)
    EMAIL_FROM_NAME: str = "Texnikum ERP"  # Yuboruvchi nomi
    
    # SMS Settings (eski funksiyalar uchun)
    SMS_PROVIDER: str = "console"  # smsuz, esmsuz, playmobile, twilio, console (development uchun)
    SMS_API_KEY: str = ""  # SMS provayder API key
    SMS_API_URL: str = ""  # SMS provayder API URL
    SMS_SENDER: str = "ERP"  # SMS yuboruvchi nomi (qisqa raqam yoki nom)
    SMS_USERNAME: str = ""  # Ba'zi provayderlar uchun username
    SMS_PASSWORD: str = ""  # Ba'zi provayderlar uchun password
    SMS_ENABLED: bool = True  # SMS yoqilgan/yochilgan
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # .env faylida qo'shimcha maydonlarni (masalan, AI sozlamalari) e'tiborsiz qoldirish


settings = Settings()

