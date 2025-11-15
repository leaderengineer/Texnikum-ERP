from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.database import engine, Base
from app.config import settings
from app.routes import api_router

# Database jadvalarni yaratish
Base.metadata.create_all(bind=engine)

# Rate Limiter sozlash
limiter = Limiter(key_func=get_remote_address)

# FastAPI app
app = FastAPI(
    title="Texnikum ERP API",
    description="Zamonaviy Texnikum uchun ERP tizimi API",
    version="1.0.0",
)

# Rate limiter'ni app'ga biriktirish
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router, prefix="/api")


@app.get("/api")
async def api_info():
    """API endpoint'lari haqida ma'lumot"""
    return {
        "message": "Texnikum ERP API",
        "version": "1.0.0",
        "endpoints": {
            "authentication": "/api/auth",
            "students": "/api/students",
            "teachers": "/api/teachers",
            "groups": "/api/groups",
            "departments": "/api/departments",
            "schedules": "/api/schedules",
            "attendance": "/api/attendance",
            "books": "/api/books",
            "dashboard": "/api/dashboard",
            "audit_logs": "/api/audit-logs",
        },
        "docs": {
            "swagger": "/docs",
            "redoc": "/redoc",
        },
        "health": "/health",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Texnikum ERP API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
@limiter.limit("100/minute")
async def health_check(request: Request):
    """Health check endpoint"""
    return {"status": "healthy"}


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Rate limit xatolik handler"""
    response = JSONResponse(
        status_code=429,
        content={
            "detail": f"Rate limit exceeded: {exc.detail}",
            "retry_after": exc.retry_after
        }
    )
    response = request.app.state.limiter._inject_headers(
        response,
        request.state.view_rate_limit
    )
    return response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )

