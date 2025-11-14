from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool, NullPool
from app.config import settings

# SQLite uchun
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=NullPool,  # SQLite uchun pool kerak emas
    )
else:
    # PostgreSQL uchun - Connection Pooling
    # Katta miqyos uchun connection pooling MUTLAQ kerak
    engine = create_engine(
        settings.DATABASE_URL,
        poolclass=QueuePool,
        pool_size=settings.DB_POOL_SIZE,  # Config'dan olinadi
        max_overflow=settings.DB_MAX_OVERFLOW,  # Config'dan olinadi
        pool_pre_ping=True,  # Connection'larni tekshirish
        pool_recycle=settings.DB_POOL_RECYCLE,  # Config'dan olinadi
        echo=False,  # SQL query'larni log qilish (production'da False)
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

