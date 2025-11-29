# OpenAI API Key Olish va Sozlash

## OpenAI API Key Olish

### 1. OpenAI Hisobini Yarating
- [OpenAI Platform](https://platform.openai.com/signup) ga o'ting
- Email va parol bilan ro'yxatdan o'ting
- Email'ni tasdiqlang

### 2. API Key Yaratish
- [API Keys](https://platform.openai.com/api-keys) bo'limiga o'ting
- "Create new secret key" tugmasini bosing
- Key nomini kiriting (masalan: "Texnikum ERP")
- "Create secret key" tugmasini bosing
- **MUHIM:** Key'ni darhol nusxalab oling, chunki u faqat bir marta ko'rsatiladi!

### 3. Bepul Credit
- Yangi hisoblar uchun $5 bepul credit beriladi
- Bu taxminan 1000-2000 ta so'rov uchun yetadi
- Credit tugagach, to'lov qilishingiz kerak bo'ladi

## Sozlash

### 1. .env Fayl Yaratish
```bash
cd backend
cp .env.example .env
```

### 2. API Key'ni Qo'yish
`.env` faylini ochib, quyidagilarni to'ldiring:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Backend Server'ni Qayta Ishga Tushirish
```bash
python -m uvicorn app.main:app --reload
```

## Bepul Alternativalar

Agar OpenAI API key olishda muammo bo'lsa, quyidagi bepul alternativalardan foydalanishingiz mumkin:

### 1. Hugging Face (Bepul)
- [Hugging Face](https://huggingface.co/) - Bepul AI modellar
- API key olish: https://huggingface.co/settings/tokens

### 2. Groq (Bepul, tez)
- [Groq](https://groq.com/) - Bepul va juda tez
- API key olish: https://console.groq.com/keys

### 3. Anthropic Claude (To'lovli, lekin yaxshi)
- [Anthropic](https://www.anthropic.com/) - Claude AI
- API key olish: https://console.anthropic.com/

## Fallback Mode

Agar API key bo'lmasa, tizim avtomatik ravishda fallback mode'ga o'tadi va oddiy javoblar beradi. Bu rejimda:
- Dars materiallari uchun resurslar
- Slaydlar yaratish maslahatlari
- Umumiy pedagogik yordam

barchasi ishlaydi, lekin AI javoblar oddiy bo'ladi.

## Narxlar

### OpenAI GPT-3.5-turbo
- Input: $0.50 per 1M tokens
- Output: $1.50 per 1M tokens
- Taxminan 1000 so'rov = $0.01-0.05

### OpenAI GPT-4
- Input: $10-30 per 1M tokens
- Output: $30-60 per 1M tokens
- Qimmatroq, lekin yaxshiroq javoblar

## Xavfsizlik

- API key'ni hech qachon GitHub'ga yuklamang!
- `.env` fayl `.gitignore` da bo'lishi kerak
- Production'da environment variables'dan foydalaning

