@echo off
echo ========================================
echo Texnikum ERP Backend Server
echo ========================================
echo.

REM Python o'rnatilganligini tekshirish
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python topilmadi!
    echo Iltimos, Python o'rnating: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/5] Python tekshirildi...
python --version

REM Virtual environment yaratish
if not exist "venv" (
    echo [2/5] Virtual environment yaratilmoqda...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Virtual environment yaratishda xatolik!
        pause
        exit /b 1
    )
) else (
    echo [2/5] Virtual environment allaqachon mavjud
)

REM Virtual environment aktivlashtirish
echo [3/5] Virtual environment aktivlashtirilmoqda...
call venv\Scripts\activate.bat

REM Pip yangilash
echo [4/5] Pip yangilanmoqda...
python -m pip install --upgrade pip --quiet

REM Dependencies o'rnatish
echo [5/5] Dependencies o'rnatilmoqda (bu biroz vaqt olishi mumkin)...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Dependencies o'rnatishda xatolik!
    pause
    exit /b 1
)

REM Database initializatsiya
echo.
echo [DB] Database initializatsiya qilinmoqda...
python init_db.py
if errorlevel 1 (
    echo [WARNING] Database initializatsiya xatosi (ehtimol allaqachon mavjud)
)

REM Server ishga tushirish
echo.
echo ========================================
echo Backend server ishga tushmoqda...
echo API: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo ========================================
echo.
python run.py

