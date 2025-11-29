"""
Email yuborish uchun utility funksiyalar
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Email yuborish
    
    Args:
        to_email: Qabul qiluvchi email
        subject: Email mavzusi
        html_content: HTML formatdagi email mazmuni
        text_content: Text formatdagi email mazmuni (ixtiyoriy)
    
    Returns:
        bool: Email muvaffaqiyatli yuborildimi
    """
    try:
        # SMTP sozlamalari tekshirish
        if not settings.EMAIL_ENABLED:
            logger.warning("Email xizmati o'chirilgan")
            return False
        
        # EMAIL_FROM bo'sh bo'lsa, EMAIL_SMTP_USERNAME dan olish
        email_from = settings.EMAIL_FROM or settings.EMAIL_SMTP_USERNAME or "noreply@texnikum.uz"
        
        # SMTP sozlamalari to'liq emas yoki xatolik bo'lsa, console'ga chiqarish (development uchun)
        smtp_configured = (
            settings.EMAIL_SMTP_HOST and 
            settings.EMAIL_SMTP_USERNAME and 
            settings.EMAIL_SMTP_PASSWORD
        )
        
        if not smtp_configured:
            # SMTP sozlamalari to'liq emas, console'ga chiqarish (development uchun)
            logger.warning("=" * 60)
            logger.warning("⚠️  SMTP SOZLAMALARI TO'LIQ EMAS!")
            logger.warning("=" * 60)
            logger.warning("Email kod console'ga chiqariladi. Haqiqiy email yuborish uchun:")
            logger.warning("1. .env faylida quyidagilarni sozlang:")
            logger.warning("   EMAIL_SMTP_USERNAME=your-email@gmail.com")
            logger.warning("   EMAIL_SMTP_PASSWORD=your-app-password")
            logger.warning("   EMAIL_FROM=your-email@gmail.com")
            logger.warning("2. Gmail App Password yarating: https://myaccount.google.com/apppasswords")
            logger.warning("3. Serverni qayta ishga tushiring")
            logger.warning("=" * 60)
            logger.info(f"[EMAIL CONSOLE] To: {to_email}")
            logger.info(f"[EMAIL CONSOLE] Subject: {subject}")
            logger.info(f"[EMAIL CONSOLE] Content: {text_content or html_content}")
            print(f"\n{'=' * 60}")
            print("⚠️  SMTP SOZLAMALARI TO'LIQ EMAS!")
            print(f"{'=' * 60}")
            print("Email kod console'ga chiqariladi. Haqiqiy email yuborish uchun:")
            print("1. .env faylida EMAIL_SMTP_USERNAME, EMAIL_SMTP_PASSWORD, EMAIL_FROM ni sozlang")
            print("2. Gmail App Password yarating: https://myaccount.google.com/apppasswords")
            print("3. Serverni qayta ishga tushiring")
            print(f"{'=' * 60}")
            print(f"\n[EMAIL CONSOLE] To: {to_email}")
            print(f"[EMAIL CONSOLE] Subject: {subject}")
            print(f"[EMAIL CONSOLE] Content:\n{text_content or html_content}\n")
            # Development rejimida ham True qaytaramiz, chunki email console'da ko'rsatildi
            return True
        
        # Email yaratish
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = email_from
        msg['To'] = to_email
        
        # Text va HTML qo'shish
        if text_content:
            part1 = MIMEText(text_content, 'plain', 'utf-8')
            msg.attach(part1)
        
        part2 = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(part2)
        
        # SMTP server orqali yuborish
        try:
            # Port 465 uchun SMTP_SSL ishlatish
            if settings.EMAIL_SMTP_PORT == 465:
                import ssl
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL(settings.EMAIL_SMTP_HOST, settings.EMAIL_SMTP_PORT, context=context) as server:
                    if settings.EMAIL_SMTP_USERNAME and settings.EMAIL_SMTP_PASSWORD:
                        server.login(settings.EMAIL_SMTP_USERNAME, settings.EMAIL_SMTP_PASSWORD)
                    server.send_message(msg)
            else:
                # Port 587 yoki boshqa portlar uchun oddiy SMTP
                with smtplib.SMTP(settings.EMAIL_SMTP_HOST, settings.EMAIL_SMTP_PORT) as server:
                    if settings.EMAIL_SMTP_USE_TLS:
                        server.starttls()
                    
                    if settings.EMAIL_SMTP_USERNAME and settings.EMAIL_SMTP_PASSWORD:
                        server.login(settings.EMAIL_SMTP_USERNAME, settings.EMAIL_SMTP_PASSWORD)
                    
                    server.send_message(msg)
            
            logger.info("=" * 60)
            logger.info("✅ EMAIL MUVAFFAQIYATLI YUBORILDI!")
            logger.info("=" * 60)
            logger.info(f"Qabul qiluvchi: {to_email}")
            logger.info(f"Mavzu: {subject}")
            logger.info("=" * 60)
            print(f"\n{'=' * 60}")
            print("✅ EMAIL MUVAFFAQIYATLI YUBORILDI!")
            print(f"{'=' * 60}")
            print(f"Qabul qiluvchi: {to_email}")
            print(f"Mavzu: {subject}")
            print(f"{'=' * 60}\n")
            return True
        except smtplib.SMTPAuthenticationError as e:
            logger.error("=" * 60)
            logger.error("❌ SMTP AUTENTIFIKATSIYA XATOLIK!")
            logger.error("=" * 60)
            logger.error(f"Xatolik: {str(e)}")
            logger.error("Tuzatish:")
            logger.error("1. Gmail App Password yarating: https://myaccount.google.com/apppasswords")
            logger.error("2. .env faylida EMAIL_SMTP_PASSWORD ga App Password ni kiriting")
            logger.error("3. 2-Step Verification yoqilganligini tekshiring")
            logger.error("4. Serverni qayta ishga tushiring")
            logger.error("=" * 60)
            logger.warning("Email kod console'ga chiqariladi (development uchun):")
            logger.info(f"[EMAIL CONSOLE] To: {to_email}")
            logger.info(f"[EMAIL CONSOLE] Subject: {subject}")
            logger.info(f"[EMAIL CONSOLE] Content: {text_content or html_content}")
            print(f"\n{'=' * 60}")
            print("❌ SMTP AUTENTIFIKATSIYA XATOLIK!")
            print(f"{'=' * 60}")
            print(f"Xatolik: {str(e)}")
            print("\nTuzatish:")
            print("1. Gmail App Password yarating: https://myaccount.google.com/apppasswords")
            print("2. .env faylida EMAIL_SMTP_PASSWORD ga App Password ni kiriting")
            print("3. 2-Step Verification yoqilganligini tekshiring")
            print("4. Serverni qayta ishga tushiring")
            print(f"{'=' * 60}")
            print(f"\n[EMAIL CONSOLE] To: {to_email}")
            print(f"[EMAIL CONSOLE] Subject: {subject}")
            print(f"[EMAIL CONSOLE] Content:\n{text_content or html_content}\n")
            # Development rejimida True qaytaramiz
            return True
        except smtplib.SMTPException as e:
            logger.error("=" * 60)
            logger.error("❌ SMTP XATOLIK!")
            logger.error("=" * 60)
            logger.error(f"Xatolik: {str(e)}")
            logger.error("Tuzatish:")
            logger.error("1. EMAIL_SMTP_HOST va EMAIL_SMTP_PORT ni tekshiring")
            logger.error("2. Internet ulanishini tekshiring")
            logger.error("3. Firewall SMTP portini bloklamaganligini tekshiring")
            logger.error("=" * 60)
            logger.warning("Email kod console'ga chiqariladi (development uchun):")
            logger.info(f"[EMAIL CONSOLE] To: {to_email}")
            logger.info(f"[EMAIL CONSOLE] Subject: {subject}")
            logger.info(f"[EMAIL CONSOLE] Content: {text_content or html_content}")
            print(f"\n{'=' * 60}")
            print("❌ SMTP XATOLIK!")
            print(f"{'=' * 60}")
            print(f"Xatolik: {str(e)}")
            print("\nTuzatish:")
            print("1. EMAIL_SMTP_HOST va EMAIL_SMTP_PORT ni tekshiring")
            print("2. Internet ulanishini tekshiring")
            print("3. Firewall SMTP portini bloklamaganligini tekshiring")
            print(f"{'=' * 60}")
            print(f"\n[EMAIL CONSOLE] To: {to_email}")
            print(f"[EMAIL CONSOLE] Subject: {subject}")
            print(f"[EMAIL CONSOLE] Content:\n{text_content or html_content}\n")
            # Development rejimida True qaytaramiz
            return True
        
    except Exception as e:
        logger.error(f"Email yuborishda xatolik: {str(e)}")
        # Boshqa xatoliklar bo'lsa ham, console'ga chiqarish (development uchun)
        logger.warning("Email yuborishda xatolik. Email console'ga chiqariladi.")
        logger.info(f"[EMAIL] To: {to_email}")
        logger.info(f"[EMAIL] Subject: {subject}")
        logger.info(f"[EMAIL] Content: {text_content or html_content}")
        print(f"\n[EMAIL] To: {to_email}")
        print(f"[EMAIL] Subject: {subject}")
        print(f"[EMAIL] Content:\n{text_content or html_content}\n")
        # Development rejimida True qaytaramiz
        return True


async def send_password_reset_email(email: str, code: str) -> bool:
    """
    Parolni tiklash kodi email orqali yuborish
    
    Args:
        email: Foydalanuvchi email
        code: 6 xonali tasodifiy kod
    
    Returns:
        bool: Email muvaffaqiyatli yuborildimi
    """
    subject = "Parolni tiklash kodi - Texnikum ERP"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }}
            .header {{
                background-color: #10b981;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }}
            .content {{
                padding: 20px;
                background-color: #f9fafb;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                padding: 20px;
                background-color: white;
                border: 2px dashed #10b981;
                border-radius: 5px;
                margin: 20px 0;
                letter-spacing: 5px;
            }}
            .warning {{
                background-color: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Texnikum ERP</h1>
                <p>Parolni tiklash</p>
            </div>
            <div class="content">
                <p>Salom,</p>
                <p>Parolni tiklash uchun quyidagi kodni kiriting:</p>
                <div class="code">{code}</div>
                <div class="warning">
                    <strong>⚠️ Xavfsizlik:</strong> Bu kodni hech kimga bermang. Kod 10 daqiqa davomida amal qiladi.
                </div>
                <p>Agar siz parolni tiklash so'rovini yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.</p>
            </div>
            <div class="footer">
                <p>© {settings.EMAIL_FROM_NAME or 'Texnikum ERP'}</p>
                <p>Bu avtomatik xabar. Javob yozmaslik kerak.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
Parolni tiklash kodi - Texnikum ERP

Salom,

Parolni tiklash uchun quyidagi kodni kiriting:

{code}

⚠️ XAVFSIZLIK: Bu kodni hech kimga bermang. Kod 10 daqiqa davomida amal qiladi.

Agar siz parolni tiklash so'rovini yubormagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.

© {settings.EMAIL_FROM_NAME or 'Texnikum ERP'}
Bu avtomatik xabar. Javob yozmaslik kerak.
    """
    
    return await send_email(email, subject, html_content, text_content)

