"""
SMS xizmatini integratsiya qilish uchun utility funksiyalar
"""
import random
import logging
import httpx
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def generate_verification_code(length: int = 6) -> str:
    """6 xonali tasodifiy kod yaratish"""
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])


async def send_sms(phone: str, message: str) -> bool:
    """
    SMS xabar yuborish
    
    Bu funksiya SMS provayder bilan integratsiya qilish uchun.
    SMS provayderlar:
    - SMS.uz (O'zbekiston) - smsuz
    - Esms.uz - esmsuz
    - Twilio - twilio
    - Console (development) - console
    
    Args:
        phone: Telefon raqami (masalan: +998901234567)
        message: Yuboriladigan xabar
    
    Returns:
        bool: SMS muvaffaqiyatli yuborildimi
    """
    if not settings.SMS_ENABLED:
        logger.warning("SMS xizmati o'chirilgan")
        return False
    
    try:
        # Development rejimida console'ga chiqarish
        if settings.SMS_PROVIDER == "console" or not settings.SMS_API_KEY:
            logger.info(f"[SMS] {phone}: {message}")
            print(f"[SMS] {phone}: {message}")
            return True
        
        # SMS.uz API
        if settings.SMS_PROVIDER == "smsuz":
            return await _send_sms_smsuz(phone, message)
        
        # Esms.uz API
        elif settings.SMS_PROVIDER == "esmsuz":
            return await _send_sms_esmsuz(phone, message)
        
        # Play Mobile API (O'zbekiston)
        elif settings.SMS_PROVIDER == "playmobile":
            return await _send_sms_playmobile(phone, message)
        
        # Twilio API
        elif settings.SMS_PROVIDER == "twilio":
            return await _send_sms_twilio(phone, message)
        
        # Boshqa provayderlar
        else:
            logger.warning(f"Noma'lum SMS provayder: {settings.SMS_PROVIDER}")
            # Fallback: console'ga chiqarish
            logger.info(f"[SMS] {phone}: {message}")
            print(f"[SMS] {phone}: {message}")
            return True
        
    except Exception as e:
        logger.error(f"SMS yuborishda xatolik: {str(e)}")
        # Xatolik bo'lsa ham, development rejimida True qaytaradi
        if settings.SMS_PROVIDER == "console" or not settings.SMS_API_KEY:
            return True
        return False


async def _send_sms_smsuz(phone: str, message: str) -> bool:
    """
    SMS.uz API orqali SMS yuborish
    """
    try:
        # Telefon raqamini formatlash (+ ni olib tashlash)
        phone_clean = phone.replace('+', '')
        
        # SMS.uz API endpoint (misol)
        # Haqiqiy API endpoint va formatni SMS.uz hujjatlaridan olish kerak
        url = settings.SMS_API_URL or "https://api.sms.uz/send"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json={
                    "phone": phone_clean,
                    "message": message,
                    "sender": settings.SMS_SENDER,
                },
                headers={
                    "Authorization": f"Bearer {settings.SMS_API_KEY}",
                    "Content-Type": "application/json",
                }
            )
            
            if response.status_code == 200:
                logger.info(f"SMS.uz orqali SMS yuborildi: {phone}")
                return True
            else:
                logger.error(f"SMS.uz xatolik: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"SMS.uz yuborishda xatolik: {str(e)}")
        return False


async def _send_sms_esmsuz(phone: str, message: str) -> bool:
    """
    Esms.uz API orqali SMS yuborish
    """
    try:
        # Telefon raqamini formatlash
        phone_clean = phone.replace('+', '')
        
        # Esms.uz API endpoint (misol)
        url = settings.SMS_API_URL or "https://api.esms.uz/send"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json={
                    "phone": phone_clean,
                    "text": message,
                    "from": settings.SMS_SENDER,
                },
                headers={
                    "X-API-KEY": settings.SMS_API_KEY,
                    "Content-Type": "application/json",
                }
            )
            
            if response.status_code == 200:
                logger.info(f"Esms.uz orqali SMS yuborildi: {phone}")
                return True
            else:
                logger.error(f"Esms.uz xatolik: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Esms.uz yuborishda xatolik: {str(e)}")
        return False


async def _send_sms_playmobile(phone: str, message: str) -> bool:
    """
    Play Mobile API orqali SMS yuborish (O'zbekiston)
    """
    try:
        # Telefon raqamini formatlash (+ ni olib tashlash)
        phone_clean = phone.replace('+', '')
        
        # Play Mobile API endpoint
        # Haqiqiy API endpoint va formatni Play Mobile hujjatlaridan olish kerak
        url = settings.SMS_API_URL or "https://api.playmobile.uz/send"
        
        # Play Mobile odatda username va password ishlatadi
        username = settings.SMS_USERNAME or settings.SMS_API_KEY
        password = settings.SMS_PASSWORD or ""
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Variant 1: Basic Auth
            if username and password:
                response = await client.post(
                    url,
                    json={
                        "phone": phone_clean,
                        "text": message,
                        "originator": settings.SMS_SENDER,  # Qisqa raqam yoki nom
                    },
                    auth=(username, password),
                    headers={
                        "Content-Type": "application/json",
                    }
                )
            # Variant 2: API Key
            else:
                response = await client.post(
                    url,
                    json={
                        "phone": phone_clean,
                        "text": message,
                        "originator": settings.SMS_SENDER,
                    },
                    headers={
                        "Authorization": f"Bearer {settings.SMS_API_KEY}",
                        "Content-Type": "application/json",
                    }
                )
            
            if response.status_code == 200:
                logger.info(f"Play Mobile orqali SMS yuborildi: {phone}")
                return True
            else:
                logger.error(f"Play Mobile xatolik: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Play Mobile yuborishda xatolik: {str(e)}")
        return False


async def _send_sms_twilio(phone: str, message: str) -> bool:
    """
    Twilio API orqali SMS yuborish
    """
    try:
        from twilio.rest import Client as TwilioClient
        
        # Twilio Account SID va Auth Token
        # SMS_API_KEY format: "account_sid:auth_token"
        credentials = settings.SMS_API_KEY.split(':')
        if len(credentials) != 2:
            logger.error("Twilio API key noto'g'ri format. Format: account_sid:auth_token")
            return False
        
        account_sid = credentials[0]
        auth_token = credentials[1]
        twilio_phone = settings.SMS_API_URL or ""  # Twilio telefon raqami
        
        client = TwilioClient(account_sid, auth_token)
        
        message_obj = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=phone
        )
        
        if message_obj.sid:
            logger.info(f"Twilio orqali SMS yuborildi: {phone} - SID: {message_obj.sid}")
            return True
        else:
            logger.error("Twilio SMS yuborilmadi")
            return False
            
    except ImportError:
        logger.error("Twilio kutubxonasi o'rnatilmagan. pip install twilio")
        return False
    except Exception as e:
        logger.error(f"Twilio yuborishda xatolik: {str(e)}")
        return False


async def send_password_reset_code(phone: str, code: str) -> bool:
    """
    Parolni tiklash kodi yuborish
    
    Args:
        phone: Telefon raqami
        code: 6 xonali tasodifiy kod
    
    Returns:
        bool: SMS muvaffaqiyatli yuborildimi
    """
    message = f"Parolni tiklash kodi: {code}. Bu kodni hech kimga bermang. Kod 10 daqiqa davomida amal qiladi."
    return await send_sms(phone, message)


def normalize_phone(phone: str) -> str:
    """
    Telefon raqamini normalize qilish
    +998901234567 formatiga keltirish
    """
    # Barcha bo'sh joylar va maxsus belgilarni olib tashlash
    phone = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Agar + bilan boshlanmasa, qo'shish
    if not phone.startswith('+'):
        # Agar 998 bilan boshlansa, + qo'shish
        if phone.startswith('998'):
            phone = '+' + phone
        # Agar 0 bilan boshlansa, 0 ni olib tashlab, +998 qo'shish
        elif phone.startswith('0'):
            phone = '+998' + phone[1:]
        else:
            # Boshqa holatda +998 qo'shish
            phone = '+998' + phone
    
    return phone


def validate_phone(phone: str) -> bool:
    """
    Telefon raqamini tekshirish
    O'zbekiston telefon raqamlari uchun: +998XXXXXXXXX (12 ta raqam)
    """
    normalized = normalize_phone(phone)
    # +998 bilan boshlanishi va keyin 9 ta raqam bo'lishi kerak
    if normalized.startswith('+998') and len(normalized) == 13:
        # Keyingi 9 ta belgi raqam bo'lishi kerak
        digits = normalized[4:]
        return digits.isdigit()
    return False

