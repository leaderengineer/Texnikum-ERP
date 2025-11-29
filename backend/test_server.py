#!/usr/bin/env python3
"""
Backend server'ni tekshirish uchun skript
"""
import sys
import os

# Joriy papkani path'ga qo'shish
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Barcha kerakli modullarni import qilish"""
    print("=" * 60)
    print("Backend Server Tekshiruvi")
    print("=" * 60)
    print()
    
    # Python versiyasi
    print(f"✓ Python versiyasi: {sys.version}")
    print()
    
    # FastAPI
    try:
        import fastapi
        print(f"✓ FastAPI: {fastapi.__version__}")
    except ImportError as e:
        print(f"✗ FastAPI topilmadi: {e}")
        print("  Yechim: pip install fastapi")
        return False
    
    # Uvicorn
    try:
        import uvicorn
        print(f"✓ Uvicorn: {uvicorn.__version__}")
    except ImportError as e:
        print(f"✗ Uvicorn topilmadi: {e}")
        print("  Yechim: pip install uvicorn[standard]")
        return False
    
    # SQLAlchemy
    try:
        import sqlalchemy
        print(f"✓ SQLAlchemy: {sqlalchemy.__version__}")
    except ImportError as e:
        print(f"✗ SQLAlchemy topilmadi: {e}")
        print("  Yechim: pip install sqlalchemy")
        return False
    
    # httpx
    try:
        import httpx
        print(f"✓ httpx: {httpx.__version__}")
    except ImportError as e:
        print(f"✗ httpx topilmadi: {e}")
        print("  Yechim: pip install httpx")
        return False
    
    print()
    
    # App import
    try:
        from app.main import app
        print("✓ App muvaffaqiyatli import qilindi")
    except Exception as e:
        print(f"✗ App import qilishda xatolik: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print()
    
    # .env fayl tekshiruvi
    if os.path.exists(".env"):
        print("✓ .env fayl topildi")
        # API key tekshiruvi
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY", "")
        if api_key and api_key.strip():
            print(f"✓ OpenAI API key topildi: {api_key[:15]}...")
        else:
            print("⚠ OpenAI API key topilmadi (fallback mode ishlaydi)")
    else:
        print("⚠ .env fayl topilmadi")
    
    print()
    print("=" * 60)
    print("Tekshiruv yakunlandi!")
    print("=" * 60)
    print()
    print("Server'ni ishga tushirish uchun:")
    print("  python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = test_imports()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\nBekor qilindi.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nXatolik: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

