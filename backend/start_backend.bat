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
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    if errorlevel 1 (
        echo [ERROR] Virtual environment aktivatsiya qilishda xatolik!
        pause
        exit /b 1
    )
    echo [OK] Virtual environment aktivatsiya qilindi
) else (
    echo [WARNING] Virtual environment topilmadi, global Python ishlatilmoqda
)

REM Pip yangilash
echo [4/5] Pip yangilanmoqda...
python -m pip install --upgrade pip --quiet

REM Dependencies o'rnatish
echo [5/5] Dependencies o'rnatilmoqda (bu biroz vaqt olishi mumkin)...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Dependencies o'rnatishda xatolik!
    echo.
    echo Yechim:
    echo 1. Internet aloqasini tekshiring
    echo 2. pip'ni yangilang: python -m pip install --upgrade pip
    echo 3. Qayta urinib ko'ring
    pause
    exit /b 1
)
echo [OK] Dependencies muvaffaqiyatli o'rnatildi

REM Database initializatsiya
echo.
echo [DB] Database initializatsiya qilinmoqda...
python init_db.py
if errorlevel 1 (
    echo [WARNING] Database initializatsiya xatosi (ehtimol allaqachon mavjud)
)

REM Port tekshiruvi
echo.
echo [INFO] Port 8000 tekshirilmoqda...
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
    if /i not "!continue!"=="y" (
        exit /b 1
    )
)

REM Server ishga tushirish
echo.
echo ========================================
echo Backend server ishga tushmoqda...
echo API: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo Health: http://localhost:8000/health
echo ========================================
echo.
echo Server'ni to'xtatish uchun Ctrl+C bosing
echo.

REM Python kodini to'g'ridan-to'g'ri ishga tushirish
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

REM Agar server yopilsa
if errorlevel 1 (
    echo.
    echo ========================================
    echo [ERROR] Server xatolik bilan yopildi!
    echo ========================================
    echo.
    echo Xatolik sabablari:
    echo 1. Port 8000 allaqachon ishlatilmoqda
    echo 2. Dependencies to'liq o'rnatilmagan
    echo 3. Database xatolik
    echo 4. .env fayl xatolik
    echo 5. Python kodida sintaksis xatolik
    echo.
    echo Yechim:
    echo 1. Boshqa terminal'da ishlayotgan server'ni to'xtating
    echo 2. Dependencies'ni qayta o'rnating: pip install -r requirements.txt
    echo 3. .env faylni tekshiring
    echo 4. Python kodini tekshiring: python -m py_compile app/main.py
    echo.
    echo Debug mode uchun: start_backend_debug.bat ishlating
    echo.
)

pause

