# Email Kodini Haqiqiy Email'ga Yuborish - Qadam-baqadam Qo'llanma

## Muammo
Hozir email kodi server terminaliga chiqyapti. Haqiqiy email manziliga yuborish uchun SMTP sozlamalarini to'g'ri sozlash kerak.

## Yechim: Gmail orqali Email Yuborish

### 1-qadam: Gmail App Password Yaratish

1. **Google Account'ingizga kiring:**
   - https://myaccount.google.com/ ga kiring
   - Email va parol bilan kirish

2. **2-Step Verification yoqing:**
   - **Security** (Xavfsizlik) bo'limiga o'ting
   - **2-Step Verification** ni toping va yoqing
   - Telefon raqamingizni tasdiqlang

3. **App Password yarating:**
   - **Security** → **2-Step Verification** → **App passwords**
   - Yoki to'g'ridan-to'g'ri: https://myaccount.google.com/apppasswords
   - **Select app** → **Mail** ni tanlang
   - **Select device** → **Other (Custom name)** ni tanlang
   - Nom kiriting: `Texnikum ERP`
   - **Generate** tugmasini bosing
   - **16 xonali parol** yaratiladi (masalan: `abcd efgh ijkl mnop`)
   - Bu parolni yozib oling!

### 2-qadam: .env Faylini Sozlash

1. **Backend papkasida `.env` faylini oching:**
   ```
   C:\Users\HP\Desktop\ERP\backend\.env
   ```

2. **Email sozlamalarini quyidagicha kiriting:**

```env
# Email Settings
EMAIL_ENABLED=true
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=sizning-email@gmail.com
EMAIL_SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=sizning-email@gmail.com
EMAIL_FROM_NAME=Texnikum ERP
```

**Muhim:**
- `EMAIL_SMTP_USERNAME` ga o'z Gmail manzilingizni kiriting
- `EMAIL_SMTP_PASSWORD` ga yaratilgan **16 xonali App Password** ni kiriting (bo'shliqlarsiz yoki bo'shliqlar bilan - ikkalasi ham ishlaydi)
- `EMAIL_FROM` ga ham o'z Gmail manzilingizni kiriting

**Misol:**
```env
EMAIL_SMTP_USERNAME=myemail@gmail.com
EMAIL_SMTP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=myemail@gmail.com
```

### 3-qadam: Serverni Qayta Ishga Tushirish

1. **Backend serverini to'xtating** (Ctrl+C)
2. **Qayta ishga tushiring:**
   ```bash
   cd backend
   source venv/Scripts/activate
   python -m uvicorn app.main:app --reload
   ```

### 4-qadam: Test Qilish

1. Frontend'da **"Parolni unutdingizmi?"** linkini bosing
2. Email manzilingizni kiriting
3. **"Kod yuborish"** tugmasini bosing
4. Email'ingizni tekshiring (Spam papkasini ham ko'rib chiqing)

## Boshqa Email Provayderlar

### Outlook/Hotmail:
```env
EMAIL_SMTP_HOST=smtp-mail.outlook.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=your-email@outlook.com
EMAIL_SMTP_PASSWORD=your-password
```

### Yandex:
```env
EMAIL_SMTP_HOST=smtp.yandex.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=your-email@yandex.com
EMAIL_SMTP_PASSWORD=your-app-password
```

### Mail.ru:
```env
EMAIL_SMTP_HOST=smtp.mail.ru
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=your-email@mail.ru
EMAIL_SMTP_PASSWORD=your-password
```

## Xatoliklarni Tuzatish

### Xatolik 1: "SMTP Authentication Error"
**Sabab:** App Password noto'g'ri yoki 2-Step Verification yoqilmagan  
**Yechim:** 
- 2-Step Verification yoqilganligini tekshiring
- App Password ni qayta yarating
- `.env` faylida parolni to'g'ri kiriting

### Xatolik 2: "Connection refused"
**Sabab:** SMTP server yoki port noto'g'ri  
**Yechim:**
- `EMAIL_SMTP_HOST` va `EMAIL_SMTP_PORT` ni tekshiring
- Gmail uchun: `smtp.gmail.com` va `587`

### Xatolik 3: Email hali ham console'ga chiqyapti
**Sabab:** `.env` fayli o'qilmagan yoki server qayta ishga tushirilmagan  
**Yechim:**
- `.env` faylini tekshiring
- Serverni to'xtatib, qayta ishga tushiring
- Backend console'da xatolik xabarlarini ko'ring

### Xatolik 4: Email Spam papkasiga tushyapti
**Sabab:** Normal holat  
**Yechim:**
- Spam papkasini tekshiring
- Email'ni "Not spam" deb belgilang

## Tekshirish

Email to'g'ri sozlangan bo'lsa, backend console'da quyidagi xabar ko'rinadi:
```
INFO: Email muvaffaqiyatli yuborildi: user@example.com
```

Agar xatolik bo'lsa, console'da aniq xatolik xabari ko'rinadi.

## Qo'shimcha Ma'lumot

- Gmail App Password: https://myaccount.google.com/apppasswords
- Email sozlamalari: `backend/app/config.py`
- Email utility: `backend/app/utils/email.py`

