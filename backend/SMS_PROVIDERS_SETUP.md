# SMS Provayderlarini Sozlash

O'zbekistonda ishlatiladigan SMS provayderlarini sozlash bo'yicha qo'llanma.

## 1. Play Mobile (O'zbekiston)

Play Mobile - O'zbekistonda eng mashhur SMS xizmatlari provayderlaridan biri.

### Sozlash:

1. [Play Mobile](https://playmobile.uz) saytida ro'yxatdan o'ting
2. Shartnoma tuzing va API ma'lumotlarini oling
3. `.env` faylida sozlang:

```env
SMS_PROVIDER=playmobile
SMS_API_URL=https://api.playmobile.uz/send
SMS_USERNAME=your-username
SMS_PASSWORD=your-password
SMS_SENDER=1234  # Qisqa raqam yoki nom (masalan: ERP)
SMS_ENABLED=true
```

**Eslatma**: Play Mobile API formatini ularning rasmiy hujjatlaridan tekshiring.

## 2. SMS.uz

### Sozlash:

```env
SMS_PROVIDER=smsuz
SMS_API_KEY=your-api-key
SMS_API_URL=https://api.sms.uz/send
SMS_SENDER=ERP
SMS_ENABLED=true
```

## 3. Esms.uz

### Sozlash:

```env
SMS_PROVIDER=esmsuz
SMS_API_KEY=your-api-key
SMS_API_URL=https://api.esms.uz/send
SMS_SENDER=ERP
SMS_ENABLED=true
```

## 4. Twilio (Xalqaro)

### Sozlash:

```env
SMS_PROVIDER=twilio
SMS_API_KEY=account_sid:auth_token
SMS_API_URL=+1234567890  # Twilio telefon raqami
SMS_SENDER=ERP
SMS_ENABLED=true
```

Va `pip install twilio` o'rnating.

## Qisqa Raqamlar

Qisqa raqamlar (masalan: 1234, 5555) orqali SMS yuborish uchun:
- Mobil operatorlar bilan shartnoma tuzish kerak
- Qisqa raqamni ro'yxatdan o'tkazish kerak
- SMS provayder orqali qisqa raqamni sozlash kerak

Qisqa raqamni `SMS_SENDER` o'rniga qo'yish mumkin:
```env
SMS_SENDER=1234  # Qisqa raqam
```

Yoki nom ishlatish mumkin:
```env
SMS_SENDER=ERP  # Nom
```

## Test Qilish

1. `.env` faylida SMS provayder ma'lumotlarini kiriting
2. Backend serverini qayta ishga tushiring
3. Parolni tiklash funksiyasini test qiling
4. Telefon raqamiga SMS kelishini tekshiring

## Xatoliklar

Agar SMS yuborilmasa:
- `.env` faylida sozlamalarni tekshiring
- Backend console'da xatolik xabarlarini ko'ring
- SMS provayder API hujjatlarini tekshiring
- API key, username, password to'g'riligini tekshiring
- Telefon raqam formatini tekshiring (+998901234567)

## Development Rejimi

Development rejimida SMS kodlar console'ga chiqadi:

```env
SMS_PROVIDER=console
SMS_ENABLED=true
```

Bu rejimda haqiqiy SMS yuborilmaydi, faqat console'da ko'rinadi.

