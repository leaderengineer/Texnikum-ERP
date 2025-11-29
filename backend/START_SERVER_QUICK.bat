@echo off
chcp 65001 >nul
title Backend Server
color 0A

echo.
echo ========================================
echo   TEXNIKUM ERP - BACKEND SERVER
echo ========================================
echo.

cd /d "%~dp0"

REM Python tekshiruvi
python --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [XATOLIK] Python topilmadi!
    echo.
    echo Iltimos, Python o'rnatilganligini tekshiring.
    echo Python yuklab olish: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [1/3] Python: OK
python --version
echo.

REM Virtual environment
if not exist "venv" (
    echo [2/3] Virtual environment yaratilmoqda...
    python -m venv venv
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip --quiet
    python -m pip install -r requirements.txt
) else (
    echo [2/3] Virtual environment aktivatsiya qilinmoqda...
    call venv\Scripts\activate.bat
)

echo [OK] Virtual environment tayyor
echo.

REM Port tozalash
echo [3/3] Port 8000 tekshirilmoqda...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 2^>nul') do (
    echo Eski jarayon to'xtatilmoqda: %%a
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo [OK] Port tayyor
echo.

REM Database tekshiruvi
if not exist "texnikum_erp.db" (
    echo Database yaratilmoqda...
    python init_db.py
)

echo.
echo ========================================
echo   SERVER ISHGA TUSHMOKDA...
echo ========================================
echo.
echo   Server: http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo   Health: http://localhost:8000/health
echo.
echo   To'xtatish: Ctrl+C
echo.
echo ========================================
echo.

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    echo.
    color 0C
    echo [XATOLIK] Server ishga tushmadi!
    echo.
    echo Yechim:
    echo 1. Dependencies: pip install -r requirements.txt
    echo 2. Debug: start_backend_debug.bat
    echo.
)

pause

