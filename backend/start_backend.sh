#!/bin/bash

echo "========================================"
echo "Texnikum ERP Backend Server"
echo "========================================"
echo ""

# Python o'rnatilganligini tekshirish
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "[ERROR] Python topilmadi!"
    echo "Iltimos, Python o'rnating: https://www.python.org/downloads/"
    exit 1
fi

# Python versiyasini aniqlash
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "[1/5] Python tekshirildi..."
$PYTHON_CMD --version

# Virtual environment yaratish
if [ ! -d "venv" ]; then
    echo "[2/5] Virtual environment yaratilmoqda..."
    $PYTHON_CMD -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Virtual environment yaratishda xatolik!"
        exit 1
    fi
else
    echo "[2/5] Virtual environment allaqachon mavjud"
fi

# Virtual environment aktivlashtirish
echo "[3/5] Virtual environment aktivlashtirilmoqda..."
source venv/bin/activate

# Pip yangilash
echo "[4/5] Pip yangilanmoqda..."
python -m pip install --upgrade pip --quiet

# Dependencies o'rnatish
echo "[5/5] Dependencies o'rnatilmoqda (bu biroz vaqt olishi mumkin)..."
pip install -r requirements.txt --quiet
if [ $? -ne 0 ]; then
    echo "[ERROR] Dependencies o'rnatishda xatolik!"
    exit 1
fi

# Database initializatsiya
echo ""
echo "[DB] Database initializatsiya qilinmoqda..."
python init_db.py

# Server ishga tushirish
echo ""
echo "========================================"
echo "Backend server ishga tushmoqda..."
echo "API: http://localhost:8000"
echo "Docs: http://localhost:8000/docs"
echo "========================================"
echo ""
python run.py

