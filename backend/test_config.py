#!/usr/bin/env python3
"""
Config tekshiruvi
"""
import sys
import os

# Joriy papkani path'ga qo'shish
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.config import settings
    print("=" * 60)
    print("✅ Settings muvaffaqiyatli yuklandi!")
    print("=" * 60)
    print()
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"Secret Key: {settings.SECRET_KEY[:20]}...")
    print(f"Port: {settings.PORT}")
    print()
    print("✅ Barcha sozlamalar to'g'ri!")
    sys.exit(0)
except Exception as e:
    print("=" * 60)
    print("❌ Xatolik!")
    print("=" * 60)
    print(f"Xatolik: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

