@echo off
echo ====================================
echo Python Versiyasini Tekshirish
echo ====================================
echo.

REM Python versiyasini tekshirish
python --version 2>nul
if %errorlevel% neq 0 (
    echo [XATOLIK] Python topilmadi yoki ishlamayapti!
    echo.
    echo Python o'rnatilganligini tekshiring:
    echo 1. Command Prompt yoki PowerShell oching (Python REPL emas!)
    echo 2. python --version komandasini yozing
    echo.
    echo Agar "Python was not found" xatosi chiqsa:
    echo - Python o'rnatilmagan yoki
    echo - PATH'ga qo'shilmagan
    echo.
    echo Python o'rnatish: https://www.python.org/downloads/
    echo.
) else (
    echo.
    echo [OK] Python topildi!
    echo.
    echo Keyingi qadam:
    echo 1. start_backend_simple.bat faylini ishga tushiring
    echo 2. Yoki qo'lda backend'ni ishga tushiring
)

echo.
pause

