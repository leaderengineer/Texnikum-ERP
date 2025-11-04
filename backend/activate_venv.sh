#!/bin/bash
# Virtual environment aktivatsiya qilish (Git Bash uchun)

echo "===================================="
echo "Virtual Environment Aktivatsiya"
echo "===================================="
echo ""

# Backend papkasiga kiring
cd "$(dirname "$0")"

# Virtual environment mavjudligini tekshirish
if [ ! -d "venv" ]; then
    echo "[XATOLIK] Virtual environment topilmadi!"
    echo ""
    echo "Avval virtual environment yaratishingiz kerak:"
    echo "  python -m venv venv"
    echo ""
    exit 1
fi

# Virtual environment aktivatsiya qilish
echo "[INFO] Virtual environment aktivatsiya qilinmoqda..."
source venv/Scripts/activate

if [ $? -eq 0 ]; then
    echo "[OK] Virtual environment aktivatsiya qilindi!"
    echo ""
    echo "Keyingi qadamlar:"
    echo "1. pip install -r requirements.txt"
    echo "2. python init_db.py"
    echo "3. python run.py"
    echo ""
    echo "Virtual environment'dan chiqish uchun: deactivate"
else
    echo "[XATOLIK] Virtual environment aktivatsiya qilishda xatolik!"
    exit 1
fi

