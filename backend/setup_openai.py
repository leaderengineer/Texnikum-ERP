#!/usr/bin/env python3
"""
OpenAI API key sozlash skripti
Bu skript .env fayl yaratadi va OpenAI API key'ni so'raydi
"""

import os
from pathlib import Path

def setup_openai_key():
    """OpenAI API key'ni sozlash"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    print("=" * 60)
    print("OpenAI API Key Sozlash")
    print("=" * 60)
    print()
    print("OpenAI API key'ni olish uchun:")
    print("1. https://platform.openai.com/signup - Hisob yarating")
    print("2. https://platform.openai.com/api-keys - API key yarating")
    print("3. Key'ni nusxalab oling (faqat bir marta ko'rsatiladi!)")
    print()
    
    # .env.example'dan .env yaratish
    if env_example.exists() and not env_file.exists():
        print("📝 .env.example'dan .env fayl yaratilmoqda...")
        with open(env_example, 'r', encoding='utf-8') as f:
            content = f.read()
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(content)
        print("✅ .env fayl yaratildi!")
        print()
    
    # Mavjud .env faylni o'qish
    env_vars = {}
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
    
    # Mavjud key'ni ko'rsatish
    current_key = env_vars.get('OPENAI_API_KEY', '')
    if current_key and current_key != 'sk-your-api-key-here':
        print(f"📌 Mavjud API key: {current_key[:10]}...{current_key[-4:]}")
        print()
        choice = input("Yangi key kiritishni xohlaysizmi? (y/n): ").lower()
        if choice != 'y':
            print("✅ Key o'zgartirilmadi.")
            return
        print()
    
    # Yangi key so'rash
    print("Yangi OpenAI API key'ni kiriting:")
    print("(Agar key bo'lmasa, Enter bosing - fallback mode ishlaydi)")
    new_key = input("API Key: ").strip()
    
    if not new_key:
        print("⚠️  Key kiritilmadi. Fallback mode ishlaydi.")
        return
    
    if not new_key.startswith('sk-'):
        print("⚠️  Key 'sk-' bilan boshlanishi kerak. Qayta urinib ko'ring.")
        return
    
    # .env faylini yangilash
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # OPENAI_API_KEY qatorini topish va yangilash
        updated = False
        for i, line in enumerate(lines):
            if line.strip().startswith('OPENAI_API_KEY='):
                lines[i] = f"OPENAI_API_KEY={new_key}\n"
                updated = True
                break
        
        # Agar topilmasa, qo'shish
        if not updated:
            lines.append(f"\nOPENAI_API_KEY={new_key}\n")
        
        with open(env_file, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    else:
        # Yangi .env fayl yaratish
        with open(env_file, 'w', encoding='utf-8') as f:
            f.write(f"OPENAI_API_KEY={new_key}\n")
            f.write("AI_MODEL=gpt-3.5-turbo\n")
            f.write("AI_API_URL=https://api.openai.com/v1/chat/completions\n")
    
    print()
    print("✅ API key muvaffaqiyatli saqlandi!")
    print()
    print("📝 Keyingi qadamlar:")
    print("1. Backend server'ni qayta ishga tushiring")
    print("2. AI chat'ni sinab ko'ring")
    print()
    print("💡 Eslatma: .env fayl .gitignore'da bo'lishi kerak!")

if __name__ == "__main__":
    try:
        setup_openai_key()
    except KeyboardInterrupt:
        print("\n\n❌ Bekor qilindi.")
    except Exception as e:
        print(f"\n\n❌ Xatolik: {e}")

