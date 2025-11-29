# SMS Xizmatini Sozlash

Parolni tiklash funksiyasi uchun SMS xizmatini sozlash bo'yicha qo'llanma.

## Development Rejimi (Console)

Development rejimida SMS kodlar console'ga chiqadi. `.env` faylida:

```env
SMS_PROVIDER=console
SMS_ENABLED=true
```

## Production Rejimi

### 1. SMS.uz

1. [SMS.uz](https://sms.uz) saytida ro'yxatdan o'ting
2. API key oling
3. `.env` faylida sozlang:

```env
SMS_PROVIDER=smsuz
SMS_API_KEY=your-sms-uz-api-key
SMS_API_URL=https://api.sms.uz/send
SMS_SENDER=ERP
SMS_ENABLED=true
```

**Eslatma**: SMS.uz API endpoint va formatini ularning rasmiy hujjatlaridan tekshiring.

### 2. Esms.uz

1. [Esms.uz](https://esms.uz) saytida ro'yxatdan o'ting
2. API key oling
3. `.env` faylida sozlang:

```env
SMS_PROVIDER=esmsuz
SMS_API_KEY=your-esms-uz-api-key
SMS_API_URL=https://api.esms.uz/send
SMS_SENDER=ERP
SMS_ENABLED=true
```

**Eslatma**: Esms.uz API endpoint va formatini ularning rasmiy hujjatlaridan tekshiring.

### 3. Twilio

1. [Twilio](https://www.twilio.com) saytida ro'yxatdan o'ting
2. Account SID va Auth Token oling
3. Telefon raqam oling
4. `.env` faylida sozlang:

```env
SMS_PROVIDER=twilio
SMS_API_KEY=account_sid:auth_token
SMS_API_URL=+1234567890  # Twilio telefon raqami
SMS_SENDER=ERP
SMS_ENABLED=true
```

5. Twilio kutubxonasini o'rnating:

```bash
pip install twilio
```

## Sozlash Qadamlari

1. `.env.example` faylini `.env` ga nusxalang
2. SMS provayder ma'lumotlarini kiriting
3. Backend serverini qayta ishga tushiring

## Test Qilish

1. Login sahifasida "Parolni unutdingizmi?" linkini bosing
2. Telefon raqamini kiriting
3. SMS kodini oling
4. Kodni kiriting va yangi parol o'rnating

## Xatoliklar

Agar SMS yuborilmasa:
- `.env` faylida sozlamalarni tekshiring
- Backend console'da xatolik xabarlarini ko'ring
- SMS provayder API hujjatlarini tekshiring
- API key va endpoint'lar to'g'riligini tekshiring

