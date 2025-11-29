@echo off
chcp 65001 >nul
echo ========================================
echo Backend Server Ishga Tushirish
echo ========================================
echo.

REM Joriy papkaga o'tish
cd /d "%~dp0"

REM Python tekshiruvi
python --version >nul 2>&1
if errorlevel 1 (
    echo [XATOLIK] Python topilmadi!
    echo Iltimos, Python o'rnatilganligini tekshiring.
    pause
    exit /b 1
)

echo [OK] Python topildi
python --version
echo.

REM Virtual environment tekshiruvi va aktivatsiya
if not exist "venv" (
    echo [INFO] Virtual environment yaratilmoqda...
    python -m venv venv
    if errorlevel 1 (
        echo [XATOLIK] Virtual environment yaratishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment yaratildi
    echo.
    echo [INFO] Dependencies o'rnatilmoqda...
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip --quiet
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [XATOLIK] Dependencies o'rnatishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Dependencies o'rnatildi
) else (
    echo [INFO] Virtual environment aktivatsiya qilinmoqda...
    call venv\Scripts\activate.bat
    if errorlevel 1 (
        echo [XATOLIK] Virtual environment aktivatsiya qilishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment aktivatsiya qilindi
)

echo.

REM Port tekshiruvi
netstat -ano | findstr :8000 >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8000 allaqachon ishlatilmoqda!
    echo.
    echo Eski server jarayonini to'xtatishga harakat qilmoqdamiz...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo [OK] Eski jarayon to'xtatildi
    echo.
)

REM Database tekshiruvi
echo [INFO] Database tekshirilmoqda...
if exist "texnikum_erp.db" (
    echo [OK] Database fayl mavjud
) else (
    echo [INFO] Database yaratilmoqda...
    python init_db.py
    if errorlevel 1 (
        echo [XATOLIK] Database yaratishda xatolik!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo [INFO] Backend server ishga tushmoqda...
echo [INFO] Server: http://localhost:8000
echo [INFO] API Docs: http://localhost:8000/docs
echo [INFO] Health: http://localhost:8000/health
echo ========================================
echo.
echo Server'ni to'xtatish uchun Ctrl+C bosing
echo.

REM Server ishga tushirish
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

if errorlevel 1 (
    echo.
    echo [XATOLIK] Server xatolik bilan yopildi!
    echo.
    echo Yechim:
    echo 1. Dependencies o'rnating: pip install -r requirements.txt
    echo 2. Python kodini tekshiring: python test_server.py
    echo.
)

pause

