@echo off
echo ====================================
echo Texnikum ERP Backend Server
echo ====================================
echo.

REM Python yo'lini tekshirish
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [XATOLIK] Python topilmadi!
    echo.
    echo Iltimos, Python o'rnating:
    echo 1. https://www.python.org/downloads/ ga kiring
    echo 2. Python 3.11+ versiyasini yuklab oling
    echo 3. O'rnatishda "Add Python to PATH" ni belgilang
    echo.
    pause
    exit /b 1
)

echo [INFO] Python topildi
python --version
echo.

REM Virtual environment yaratish
if not exist "venv" (
    echo [INFO] Virtual environment yaratilmoqda...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [XATOLIK] Virtual environment yaratishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment yaratildi
)

REM Virtual environment aktivatsiya qilish
echo [INFO] Virtual environment aktivatsiya qilinmoqda...
call venv\Scripts\activate.bat
if %errorlevel% neq 0 (
    echo [XATOLIK] Virtual environment aktivatsiya qilishda xatolik!
    pause
    exit /b 1
)

REM Dependencies o'rnatish
echo [INFO] Dependencies o'rnatilmoqda...
echo [INFO] SQLite uchun asosiy dependencies o'rnatilmoqda...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [XATOLIK] Dependencies o'rnatishda xatolik!
    pause
    exit /b 1
)
echo [OK] Dependencies muvaffaqiyatli o'rnatildi

REM Database initializatsiya
echo [INFO] Database initializatsiya qilinmoqda...
python init_db.py
if %errorlevel% neq 0 (
    echo [XATOLIK] Database initializatsiya qilishda xatolik!
    pause
    exit /b 1
)

REM Server ishga tushirish
echo.
echo ====================================
echo [OK] Backend server ishga tushmoqda...
echo [INFO] Server: http://localhost:8000
echo [INFO] API Docs: http://localhost:8000/docs
echo ====================================
echo.
echo Server'ni to'xtatish uchun Ctrl+C bosing
echo.

python run.py
if errorlevel 1 (
    echo.
    echo [XATOLIK] Server ishga tushirishda xatolik!
    echo.
    echo Mumkin bo'lgan sabablar:
    echo 1. Port 8000 allaqachon ishlatilmoqda
    echo 2. Dependencies to'liq o'rnatilmagan
    echo 3. Database xatolik
    echo 4. .env fayl xatolik
    echo.
    echo Yechim:
    echo 1. Boshqa terminal'da ishlayotgan server'ni to'xtating
    echo 2. Yoki port'ni o'zgartiring
    echo 3. Dependencies'ni qayta o'rnating: pip install -r requirements.txt
    echo.
)
pause

