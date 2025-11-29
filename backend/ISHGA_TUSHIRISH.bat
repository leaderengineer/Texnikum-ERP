@echo off
chcp 65001 >nul
title Backend Server - Ishga Tushirish
color 0B

cls
echo.
echo ========================================
echo   TEXNIKUM ERP - BACKEND SERVER
echo   Server Ishga Tushirish
echo ========================================
echo.

cd /d "%~dp0"

REM 1. Python tekshiruvi
echo [1/4] Python tekshirilmoqda...
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo [XATOLIK] Python topilmadi!
    echo.
    echo Iltimos, Python o'rnatilganligini tekshiring.
    echo Python yuklab olish: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
python --version
echo [OK] Python topildi
echo.

REM 2. Virtual environment
echo [2/4] Virtual environment tekshirilmoqda...
if not exist "venv" (
    echo Virtual environment yaratilmoqda...
    python -m venv venv
    if errorlevel 1 (
        color 0C
        echo [XATOLIK] Virtual environment yaratishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment yaratildi
) else (
    echo [OK] Virtual environment mavjud
)

REM Virtual environment aktivatsiya
echo Virtual environment aktivatsiya qilinmoqda...
call venv\Scripts\activate.bat
if errorlevel 1 (
    color 0C
    echo [XATOLIK] Virtual environment aktivatsiya qilishda xatolik!
    pause
    exit /b 1
)
echo [OK] Virtual environment aktivatsiya qilindi
echo.

REM 3. Dependencies
echo [3/4] Dependencies o'rnatilmoqda...
echo (Bu biroz vaqt olishi mumkin, kuting...)
echo.
python -m pip install --upgrade pip --quiet
python -m pip install -r requirements.txt
if errorlevel 1 (
    color 0C
    echo.
    echo [XATOLIK] Dependencies o'rnatishda xatolik!
    echo.
    echo Yechim:
    echo 1. Internet aloqasini tekshiring
    echo 2. Qayta urinib ko'ring
    echo.
    pause
    exit /b 1
)
echo [OK] Dependencies o'rnatildi
echo.

REM 4. Database
echo [4/4] Database tekshirilmoqda...
if not exist "texnikum_erp.db" (
    echo Database yaratilmoqda...
    python init_db.py
    if errorlevel 1 (
        echo [WARNING] Database yaratishda xatolik (ehtimol allaqachon mavjud)
    ) else (
        echo [OK] Database yaratildi
    )
) else (
    echo [OK] Database mavjud
)
echo.

REM Port tozalash
echo Port 8000 tekshirilmoqda...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 2^>nul') do (
    echo Eski jarayon to'xtatilmoqda...
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo [OK] Port tayyor
echo.

REM Server ishga tushirish
color 0A
cls
echo.
echo ========================================
echo   SERVER ISHGA TUSHDI!
echo ========================================
echo.
echo   Server: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Health: http://localhost:8000/health
echo.
echo   Server'ni to'xtatish uchun Ctrl+C bosing
echo.
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    color 0C
    echo.
    echo [XATOLIK] Server ishga tushmadi!
    echo.
    echo Yechim:
    echo 1. Dependencies: pip install -r requirements.txt
    echo 2. Debug: start_backend_debug.bat
    echo.
)

pause

