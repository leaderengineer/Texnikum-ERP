# Email Sozlash

Parolni tiklash funksiyasi uchun email yuborishni sozlash bo'yicha qo'llanma.

## Development Rejimi

Development rejimida email console'ga chiqadi. Email kodini backend console'da ko'rishingiz mumkin.

## Production Rejimi (Haqiqiy Email Yuborish)

Haqiqiy email yuborish uchun `.env` faylida SMTP sozlamalarini kiriting:

### Gmail uchun:

```env
EMAIL_ENABLED=true
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USE_TLS=true
EMAIL_SMTP_USERNAME=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Texnikum ERP
```

**Eslatma**: Gmail uchun "App Password" yaratish kerak:
1. Google Account → Security → 2-Step Verification yoqing
2. App passwords → Create app password
3. Yaratilgan parolni `EMAIL_SMTP_PASSWORD` ga qo'ying

### Boshqa Email Provayderlar:

**Outlook/Hotmail:**
```env
EMAIL_SMTP_HOST=smtp-mail.outlook.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USE_TLS=true
```

**Yandex:**
```env
EMAIL_SMTP_HOST=smtp.yandex.com
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USE_TLS=true
```

**Mail.ru:**
```env
EMAIL_SMTP_HOST=smtp.mail.ru
EMAIL_SMTP_PORT=465
EMAIL_SMTP_USE_TLS=true
```

## Test Qilish

1. `.env` faylida email sozlamalarini kiriting
2. Backend serverini qayta ishga tushiring
3. Parolni tiklash funksiyasini test qiling
4. Email'ingizni tekshiring

## Xatoliklar

Agar email yuborilmasa:
- `.env` faylida sozlamalarni tekshiring
- Backend console'da xatolik xabarlarini ko'ring
- SMTP server va port to'g'riligini tekshiring
- App password to'g'riligini tekshiring (Gmail uchun)

