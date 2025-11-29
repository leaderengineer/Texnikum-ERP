# 🚀 Hetzner Cloud'da Backend Deploy Qilish (Batafsil Qo'llanma)

## 📋 Kirish

Bu qo'llanma Hetzner Cloud'da ERP backend'ini deploy qilish uchun step-by-step ko'rsatma.

**Narx:** €4.50/oy (1 vCPU, 2GB RAM, 20GB SSD) - 150 foydalanuvchi uchun yetarli!

---

## 1️⃣ Hetzner Account Yaratish

1. **Hetzner Cloud'ga kiring:**
   ```
   https://www.hetzner.com/cloud
   ```

2. **"Sign Up" tugmasini bosing**

3. **Ma'lumotlarni kiriting:**
   - Email
   - Parol
   - Telefon raqami (SMS verification)

4. **Email'ni tasdiqlang**

5. **Telefon raqamini tasdiqlang** (SMS code)

6. **Payment method qo'shing:**
   - Kredit karta yoki PayPal
   - Minimum: €20 deposit (keyin ishlatiladi)

---

## 2️⃣ Server Yaratish

1. **Dashboard'da "Create Server" tugmasini bosing**

2. **Server sozlamalari:**
   - **Location:** Nuremberg (Yevropa) yoki Ashburn (AQSH)
   - **Image:** Ubuntu 22.04
   - **Type:** CPX11 (€4.50/oy)
     - 1 vCPU
     - 2GB RAM
     - 20GB SSD
   - **SSH Keys:** Yaratish yoki qo'shish
   - **Networks:** Default
   - **Firewalls:** Default (port 22, 80, 443 ochiq)

3. **"Create & Buy Now" tugmasini bosing**

4. **Server yaratiladi (1-2 daqiqa)**

5. **Server IP'ni yozib oling** (masalan: `123.45.67.89`)

---

## 3️⃣ Server'ga Ulanish

### Windows (Git Bash yoki PowerShell):

```bash
# SSH key yaratish (agar yo'q bo'lsa)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key'ni ko'rish
cat ~/.ssh/id_ed25519.pub

# Public key'ni Hetzner'ga qo'shing (Server yaratishda)
# Keyin server'ga ulaning
ssh root@YOUR_SERVER_IP
```

### Mac/Linux:

```bash
# SSH key yaratish (agar yo'q bo'lsa)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Public key'ni ko'rish
cat ~/.ssh/id_ed25519.pub

# Public key'ni Hetzner'ga qo'shing (Server yaratishda)
# Keyin server'ga ulaning
ssh root@YOUR_SERVER_IP
```

---

## 4️⃣ Server'ni Yangilash

```bash
# Server'ga ulanganingizdan keyin
apt update
apt upgrade -y
```

---

## 5️⃣ PostgreSQL O'rnatish

```bash
# PostgreSQL o'rnatish
apt install postgresql postgresql-contrib -y

# PostgreSQL status tekshirish
systemctl status postgresql

# PostgreSQL'ga kirish
sudo -u postgres psql
```

**PostgreSQL'da:**

```sql
-- Database yaratish
CREATE DATABASE texnikum_erp;

-- User yaratish
CREATE USER erp_user WITH PASSWORD 'your-secure-password-here';

-- Database'ga ruxsat berish
GRANT ALL PRIVILEGES ON DATABASE texnikum_erp TO erp_user;

-- PostgreSQL'dan chiqish
\q
```

**PostgreSQL sozlamalarini o'zgartirish:**

```bash
# PostgreSQL config faylini ochish
nano /etc/postgresql/14/main/postgresql.conf
```

**Qidirish va o'zgartirish:**
```
#listen_addresses = 'localhost'
listen_addresses = 'localhost'
```

**PostgreSQL'ni qayta ishga tushirish:**

```bash
systemctl restart postgresql
```

**Connection test:**

```bash
# Test qilish
sudo -u postgres psql -d texnikum_erp -c "SELECT version();"
```

---

## 6️⃣ Python va Dependencies O'rnatish

```bash
# Python 3.10+ o'rnatish
apt install python3 python3-pip python3-venv -y

# Python versiyasini tekshirish
python3 --version  # Python 3.10+ bo'lishi kerak
```

---

## 7️⃣ Backend Kodini Server'ga Yuklash

### Usul 1: Git Clone (Tavsiya)

```bash
# Git o'rnatish
apt install git -y

# Repository'ni clone qilish
cd /root
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

# Yoki agar private repo bo'lsa:
# SSH key qo'shing yoki HTTPS token ishlating
```

### Usul 2: SCP orqali (Local'dan)

**Local kompyuterdan:**

```bash
# Backend papkasini server'ga yuklash
scp -r backend root@YOUR_SERVER_IP:/root/erp-backend
```

**Server'da:**

```bash
cd /root/erp-backend
```

---

## 8️⃣ Virtual Environment va Dependencies

```bash
# Virtual environment yaratish
python3 -m venv venv

# Virtual environment'ni aktivlashtirish
source venv/bin/activate

# Dependencies o'rnatish
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 9️⃣ Environment Variables Sozlash

```bash
# .env fayl yaratish
nano .env
```

**Quyidagilarni kiriting:**

```env
# Database
DATABASE_URL=postgresql://erp_user:your-secure-password-here@localhost:5432/texnikum_erp

# JWT
SECRET_KEY=your-very-secret-key-min-32-chars-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (Frontend URL'lar)
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app

# Server
HOST=0.0.0.0
PORT=8000

# Database Pool (150 foydalanuvchi uchun)
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40
DB_POOL_RECYCLE=3600

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=100

# Cache
CACHE_TTL_SECONDS=300
```

**Faylni saqlash:** `Ctrl+O`, `Enter`, `Ctrl+X`

**SECRET_KEY yaratish:**

```bash
# SECRET_KEY yaratish
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Yaratilgan key'ni `.env` faylga qo'ying.**

---

## 🔟 Database Migration

```bash
# Virtual environment aktiv bo'lishi kerak
source venv/bin/activate

# Alembic o'rnatish (agar requirements.txt'da yo'q bo'lsa)
pip install alembic

# Migration yaratish (agar kerak bo'lsa)
# alembic revision --autogenerate -m "Initial migration"

# Migration'ni ishga tushirish
# alembic upgrade head

# Yoki SQLAlchemy avtomatik yaratadi (app/main.py'da Base.metadata.create_all)
```

**Test qilish:**

```bash
# Backend'ni test ishga tushirish
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Boshqa terminal'da test:**

```bash
# Server'da
curl http://localhost:8000/health

# Yoki browser'da
# http://YOUR_SERVER_IP:8000/health
```

**Agar ishlayotgan bo'lsa, `Ctrl+C` bilan to'xtating.**

---

## 1️⃣1️⃣ Systemd Service Yaratish

```bash
# Service fayl yaratish
nano /etc/systemd/system/erp-backend.service
```

**Quyidagilarni kiriting:**

```ini
[Unit]
Description=ERP Backend API
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/your-repo/backend
Environment="PATH=/root/your-repo/backend/venv/bin"
ExecStart=/root/your-repo/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=erp-backend

[Install]
WantedBy=multi-user.target
```

**⚠️ MUHIM:** `WorkingDirectory` va `ExecStart` dagi yo'llarni o'z repository yo'lingizga o'zgartiring!

**Faylni saqlash:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Service'ni ishga tushirish:**

```bash
# Systemd'ni yangilash
systemctl daemon-reload

# Service'ni enable qilish (boot'da avtomatik ishga tushishi uchun)
systemctl enable erp-backend

# Service'ni ishga tushirish
systemctl start erp-backend

# Status tekshirish
systemctl status erp-backend
```

**Agar xatolik bo'lsa:**

```bash
# Log'larni ko'rish
journalctl -u erp-backend -f

# Yoki
journalctl -u erp-backend --since "10 minutes ago"
```

---

## 1️⃣2️⃣ Nginx Reverse Proxy O'rnatish

```bash
# Nginx o'rnatish
apt install nginx -y

# Nginx config fayl yaratish
nano /etc/nginx/sites-available/erp-backend
```

**Quyidagilarni kiriting:**

```nginx
server {
    listen 80;
    server_name api.yourdomain.com YOUR_SERVER_IP;

    # Client body size limit (file upload uchun)
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (agar kerak bo'lsa)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout'lar
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**⚠️ MUHIM:** `server_name` dagi `api.yourdomain.com` ni o'z domain'ingizga o'zgartiring!

**Faylni saqlash:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Nginx config'ni aktivlashtirish:**

```bash
# Symlink yaratish
ln -s /etc/nginx/sites-available/erp-backend /etc/nginx/sites-enabled/

# Default config'ni o'chirish (agar kerak bo'lsa)
rm /etc/nginx/sites-enabled/default

# Nginx config'ni tekshirish
nginx -t

# Nginx'ni qayta ishga tushirish
systemctl restart nginx

# Nginx status tekshirish
systemctl status nginx
```

**Test qilish:**

```bash
# Server'da
curl http://localhost/health

# Yoki browser'da
# http://YOUR_SERVER_IP/health
```

---

## 1️⃣3️⃣ SSL Sertifikat (Let's Encrypt)

**⚠️ Domain kerak!** Agar domain bo'lmasa, bu qadamni o'tkazib yuborishingiz mumkin.

```bash
# Certbot o'rnatish
apt install certbot python3-certbot-nginx -y

# SSL sertifikat olish
certbot --nginx -d api.yourdomain.com

# Yoki interaktiv:
certbot --nginx
```

**Certbot so'raladi:**
- Email kiriting
- Terms of Service'ni qabul qiling
- Domain'ni tanlang

**SSL avtomatik sozlanadi va Nginx config yangilanadi.**

**Auto-renewal test:**

```bash
# Auto-renewal test
certbot renew --dry-run
```

**Auto-renewal avtomatik ishlaydi (systemd timer orqali).**

---

## 1️⃣4️⃣ Firewall Sozlash

```bash
# UFW (Uncomplicated Firewall) o'rnatish
apt install ufw -y

# Firewall'ni enable qilish
ufw enable

# Port'larni ochish
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Firewall status tekshirish
ufw status
```

---

## 1️⃣5️⃣ Domain DNS Sozlash

**Domain provider'ingizda (masalan: Cloudflare, Namecheap):**

1. **DNS sozlamalariga kiring**

2. **A Record qo'shing:**
   - **Type:** A
   - **Name:** `api` (yoki `@` agar root domain bo'lsa)
   - **Value:** `YOUR_SERVER_IP`
   - **TTL:** 3600 (yoki Auto)

3. **CNAME Record (www uchun, ixtiyoriy):**
   - **Type:** CNAME
   - **Name:** `www.api`
   - **Value:** `api.yourdomain.com`
   - **TTL:** 3600

4. **DNS propagation kutish:** 5-30 daqiqa

5. **Test qilish:**
   ```bash
   # DNS tekshirish
   nslookup api.yourdomain.com
   
   # Yoki
   dig api.yourdomain.com
   ```

---

## 1️⃣6️⃣ Frontend CORS Sozlash

**Backend `.env` faylida:**

```env
CORS_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app,http://localhost:5173
```

**Service'ni qayta ishga tushirish:**

```bash
systemctl restart erp-backend
```

---

## 1️⃣7️⃣ Test Qilish

### 1. Health Check:

```bash
# Server'da
curl http://localhost:8000/health

# Yoki browser'da
# https://api.yourdomain.com/health
```

### 2. API Endpoints:

```bash
# API info
curl https://api.yourdomain.com/api

# Swagger UI
# https://api.yourdomain.com/docs
```

### 3. Frontend'dan Test:

- Frontend'da API URL'ni o'zgartiring:
  ```javascript
  // src/services/api.js
  const API_BASE_URL = 'https://api.yourdomain.com';
  ```

- Frontend'ni deploy qiling (Vercel)

- Test qiling: login, ma'lumot qo'shish, ko'rish

---

## 1️⃣8️⃣ Monitoring va Logs

### Logs Ko'rish:

```bash
# Backend logs
journalctl -u erp-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

### Monitoring:

**Uptime Robot (Bepul):**
1. https://uptimerobot.com/ ga kiring
2. Account yarating
3. "Add New Monitor"
4. **Type:** HTTP(s)
5. **URL:** `https://api.yourdomain.com/health`
6. **Interval:** 5 minutes
7. **Alert Contacts:** Email qo'shing

---

## 1️⃣9️⃣ Backup

### Database Backup:

```bash
# Backup script yaratish
nano /root/backup-db.sh
```

**Quyidagilarni kiriting:**

```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="texnikum_erp"
DB_USER="erp_user"

mkdir -p $BACKUP_DIR

# Database backup
PGPASSWORD='your-secure-password-here' pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Eski backup'larni o'chirish (7 kundan eski)
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete

echo "Backup completed: db_backup_$DATE.sql"
```

**Faylni saqlash va executable qilish:**

```bash
chmod +x /root/backup-db.sh
```

**Cron job qo'shish (har kuni ertalab 2:00 da):**

```bash
crontab -e
```

**Quyidagilarni qo'shing:**

```
0 2 * * * /root/backup-db.sh >> /root/backup.log 2>&1
```

---

## 2️⃣0️⃣ Troubleshooting

### Backend ishlamayapti:

```bash
# Service status
systemctl status erp-backend

# Logs
journalctl -u erp-backend -n 50

# Manual ishga tushirish
cd /root/your-repo/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Database connection xatolik:

```bash
# PostgreSQL status
systemctl status postgresql

# Connection test
sudo -u postgres psql -d texnikum_erp -c "SELECT 1;"

# .env fayl tekshirish
cat /root/your-repo/backend/.env | grep DATABASE_URL
```

### Nginx xatolik:

```bash
# Nginx config test
nginx -t

# Nginx logs
tail -f /var/log/nginx/error.log
```

### Port band:

```bash
# Port 8000 ni tekshirish
netstat -tulpn | grep 8000

# Yoki
lsof -i :8000
```

---

## ✅ Checklist

- [ ] Hetzner account yaratildi
- [ ] Server yaratildi (CPX11)
- [ ] Server'ga ulanish test qilindi
- [ ] PostgreSQL o'rnatildi va sozlandi
- [ ] Python va dependencies o'rnatildi
- [ ] Backend kod yuklandi
- [ ] Virtual environment yaratildi
- [ ] Environment variables sozlandi
- [ ] Database migration ishga tushirildi
- [ ] Systemd service yaratildi va ishga tushirildi
- [ ] Nginx o'rnatildi va sozlandi
- [ ] SSL sertifikat o'rnatildi (Let's Encrypt)
- [ ] Firewall sozlandi
- [ ] Domain DNS sozlandi
- [ ] Frontend CORS sozlandi
- [ ] Test qilindi
- [ ] Monitoring sozlandi
- [ ] Backup sozlandi

---

## 🎯 Xulosa

**Hetzner Cloud'da backend muvaffaqiyatli deploy qilindi!**

**Narx:** €4.50/oy (~$5/oy)

**150 foydalanuvchi uchun yetarli!**

**Savol bo'lsa, ayting!** 😊

