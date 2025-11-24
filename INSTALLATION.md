# دليل التثبيت والنشر

توثيق شامل لتثبيت ونشر منصة التقارير والإحصائيات لصيدلية سامي.

## المتطلبات الأساسية

### التطوير المحلي
- **Node.js**: الإصدار 22 أو أحدث
- **pnpm**: مدير المكتبات
- **MySQL**: الإصدار 8.0 أو أحدث
- **Git**: للتحكم بالإصدارات

### الإنتاج
- **Docker**: للحاويات
- **Docker Compose**: لتنسيق الخدمات
- **Nginx**: كـ reverse proxy
- **SSL Certificate**: لـ HTTPS

## التثبيت المحلي

### 1. استنساخ المشروع

```bash
git clone https://github.com/sami-pharmacy/analytics-platform.git
cd sami_aumet_analytics
```

### 2. تثبيت المكتبات

```bash
# تثبيت pnpm إذا لم يكن مثبتاً
npm install -g pnpm

# تثبيت المكتبات
pnpm install
```

### 3. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
mysql -u root -p < scripts/init-db.sql

# تشغيل الـ migrations
pnpm db:push
```

### 4. إعداد متغيرات البيئة

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل المتغيرات
nano .env
```

### 5. بدء خادم التطوير

```bash
pnpm dev
```

الموقع سيكون متاحاً على: `http://localhost:5173`

## النشر على الإنتاج

### باستخدام Docker

#### 1. بناء الصورة

```bash
docker build -t sami-pharmacy-analytics:latest .
```

#### 2. تشغيل الحاويات

```bash
# نسخ ملف البيئة للإنتاج
cp .env.production .env

# تشغيل Docker Compose
docker-compose up -d
```

#### 3. التحقق من الحالة

```bash
# عرض السجلات
docker-compose logs -f app

# التحقق من الصحة
curl http://localhost:3000/health
```

### النشر اليدوي

#### 1. إعداد الخادم

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت المتطلبات
sudo apt install -y nodejs npm nginx mysql-server curl git

# تثبيت pnpm
npm install -g pnpm
```

#### 2. استنساخ المشروع

```bash
cd /var/www
sudo git clone https://github.com/sami-pharmacy/analytics-platform.git sami-analytics
cd sami-analytics
```

#### 3. تثبيت المكتبات

```bash
sudo pnpm install --prod
```

#### 4. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
sudo mysql < scripts/init-db.sql

# تشغيل الـ migrations
sudo pnpm db:push
```

#### 5. إعداد Nginx

```bash
# نسخ ملف الإعدادات
sudo cp nginx.conf /etc/nginx/sites-available/sami-analytics

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/sami-analytics /etc/nginx/sites-enabled/

# اختبار الإعدادات
sudo nginx -t

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

#### 6. إعداد SSL

```bash
# تثبيت Certbot
sudo apt install -y certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot certonly --nginx -d reports.sami-pharmacy.com

# تفعيل التجديد التلقائي
sudo systemctl enable certbot.timer
```

#### 7. بدء التطبيق

```bash
# استخدام PM2 لإدارة العملية
sudo npm install -g pm2

# بدء التطبيق
sudo pm2 start dist/server/index.js --name "sami-analytics"

# حفظ الإعدادات
sudo pm2 save

# تفعيل البدء التلقائي
sudo pm2 startup
```

## الإعدادات المهمة

### متغيرات البيئة

```bash
# قاعدة البيانات
DATABASE_URL=mysql://user:password@localhost:3306/sami_pharmacy

# Odoo ERP
ODOO_URL=https://odoo.sami-pharmacy.com
ODOO_DB=sami_pharmacy
ODOO_USERNAME=admin
ODOO_PASSWORD=secure_password

# الخادم
PORT=3000
NODE_ENV=production

# الأمان
JWT_SECRET=your_very_secure_jwt_secret
SESSION_SECRET=your_very_secure_session_secret

# البريد الإلكتروني
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### إعدادات Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name reports.sami-pharmacy.com;

    ssl_certificate /etc/letsencrypt/live/reports.sami-pharmacy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reports.sami-pharmacy.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## النسخ الاحتياطية

### النسخ الاحتياطي اليدوي

```bash
# نسخ قاعدة البيانات
mysqldump -u user -p sami_pharmacy > backup_$(date +%Y%m%d_%H%M%S).sql

# نسخ الملفات
tar -czf sami-analytics-backup-$(date +%Y%m%d_%H%M%S).tar.gz /var/www/sami-analytics
```

### النسخ الاحتياطي التلقائي

```bash
# إنشاء script للنسخ الاحتياطي
sudo nano /usr/local/bin/backup-sami-analytics.sh

#!/bin/bash
BACKUP_DIR="/backups/sami-analytics"
DATE=$(date +%Y%m%d_%H%M%S)

# نسخ قاعدة البيانات
mysqldump -u user -p sami_pharmacy > $BACKUP_DIR/db_$DATE.sql

# نسخ الملفات
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/sami-analytics

# حذف النسخ القديمة (أكثر من 30 يوم)
find $BACKUP_DIR -type f -mtime +30 -delete

# إضافة إلى crontab
0 2 * * * /usr/local/bin/backup-sami-analytics.sh
```

## المراقبة والسجلات

### عرض السجلات

```bash
# سجلات التطبيق
tail -f /var/log/sami-analytics/app.log

# سجلات الأخطاء
tail -f /var/log/sami-analytics/error.log

# سجلات Nginx
tail -f /var/log/nginx/sami-analytics.log
```

### مراقبة الأداء

```bash
# استخدام PM2
pm2 monit

# استخدام top
top

# استخدام htop
htop
```

## استكشاف الأخطاء

### المشكلة: قاعدة البيانات غير متصلة

```bash
# التحقق من حالة MySQL
sudo systemctl status mysql

# إعادة تشغيل MySQL
sudo systemctl restart mysql

# التحقق من الاتصال
mysql -u user -p -e "SELECT 1"
```

### المشكلة: الموقع لا يفتح

```bash
# التحقق من Nginx
sudo nginx -t
sudo systemctl restart nginx

# التحقق من الجدار الناري
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### المشكلة: الأداء بطيء

```bash
# التحقق من استخدام الموارد
free -h
df -h

# التحقق من عمليات Node.js
ps aux | grep node

# إعادة تشغيل التطبيق
pm2 restart sami-analytics
```

## الصيانة الدورية

### تحديثات الأمان

```bash
# تحديث المكتبات
pnpm update

# التحقق من الثغرات الأمنية
pnpm audit

# إصلاح الثغرات
pnpm audit --fix
```

### تنظيف قاعدة البيانات

```bash
# تحسين الجداول
mysql -u user -p sami_pharmacy -e "OPTIMIZE TABLE *"

# حذف البيانات القديمة
mysql -u user -p sami_pharmacy -e "DELETE FROM logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY)"
```

## الدعم والمساعدة

للحصول على الدعم:
- البريد الإلكتروني: support@sami-pharmacy.com
- الهاتف: +966 XX XXX XXXX
- الموقع: https://sami-pharmacy.com

---

**آخر تحديث**: 11 نوفمبر 2024
**الإصدار**: 1.0.0
