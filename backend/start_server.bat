@echo off
chcp 65001 >nul
echo ========================================
echo Texnikum ERP Backend Server
echo ========================================
echo.

REM Joriy papkaga o'tish
cd /d "%~dp0"

REM Python tekshiruvi
python --version >nul 2>&1
if errorlevel 1 (
    echo [XATOLIK] Python topilmadi!
    echo Iltimos, Python o'rnating: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python topildi
python --version
echo.

REM Virtual environment aktivatsiya
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Virtual environment aktivatsiya qilinmoqda...
    call venv\Scripts\activate.bat
    if errorlevel 1 (
        echo [XATOLIK] Virtual environment aktivatsiya qilishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment aktivatsiya qilindi
) else (
    echo [WARNING] Virtual environment topilmadi
    echo [INFO] Global Python ishlatilmoqda
)
echo.

REM Port tekshiruvi
netstat -ano | findstr :8000 >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8000 allaqachon ishlatilmoqda!
    echo.
    echo Yechim:
    echo 1. Boshqa terminal'da ishlayotgan server'ni to'xtating
    echo 2. Yoki quyidagi buyruqni bajarib, jarayonni toping:
    echo    netstat -ano ^| findstr :8000
    echo.
    set /p continue="Davom etishni xohlaysizmi? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
)
echo.

REM .env fayl tekshiruvi
if exist ".env" (
    echo [OK] .env fayl topildi
) else (
    echo [WARNING] .env fayl topilmadi
)
echo.

REM Server ishga tushirish
echo ========================================
echo [INFO] Backend server ishga tushmoqda...
echo [INFO] Server: http://localhost:8000
echo [INFO] API Docs: http://localhost:8000/docs
echo [INFO] Health: http://localhost:8000/health
echo ========================================
echo.
echo Server'ni to'xtatish uchun Ctrl+C bosing
echo.

REM Uvicorn orqali server ishga tushirish
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Agar server yopilsa
if errorlevel 1 (
    echo.
    echo ========================================
    echo [XATOLIK] Server xatolik bilan yopildi!
    echo ========================================
    echo.
    echo Xatolik sabablari:
    echo 1. Port 8000 allaqachon ishlatilmoqda
    echo 2. Dependencies to'liq o'rnatilmagan
    echo 3. Database xatolik
    echo 4. Python kodida sintaksis xatolik
    echo.
    echo Yechim:
    echo 1. Dependencies o'rnating: pip install -r requirements.txt
    echo 2. Python kodini tekshiring: python -c "from app.main import app"
    echo 3. Port'ni tekshiring: netstat -ano ^| findstr :8000
    echo.
)

pause

