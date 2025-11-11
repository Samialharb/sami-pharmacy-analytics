# 🚀 تعليمات النشر والإطلاق

دليل شامل لنشر منصة التقارير والإحصائيات على الخادم الإنتاجي.

## 📋 المتطلبات قبل النشر

### البيئة
- Node.js 22.13.0 أو أحدث
- pnpm 10.20.0 أو أحدث
- MySQL/TiDB 5.7 أو أحدث
- خادم ويب (Nginx/Apache)

### البيانات المطلوبة
- بيانات الاتصال بـ Odoo ERP
- بيانات الاتصال بقاعدة البيانات
- شهادات SSL (اختياري)

## 🔧 خطوات النشر

### 1. التحضير

```bash
# استنساخ المشروع
git clone <repository-url> sami_aumet_analytics
cd sami_aumet_analytics

# تثبيت المكتبات
pnpm install

# إنشاء ملف .env
cp .env.example .env

# تعديل متغيرات البيئة
nano .env
```

### 2. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات
mysql -u root -p -e "CREATE DATABASE sami_aumet;"

# تشغيل الـ migrations
pnpm db:push

# التحقق من الجداول
mysql -u root -p sami_aumet -e "SHOW TABLES;"
```

### 3. البناء

```bash
# بناء المشروع
pnpm build

# اختبار البناء
pnpm preview
```

### 4. النشر على الخادم

```bash
# استخدام PM2 لإدارة العملية
pnpm global add pm2

# بدء التطبيق
pm2 start "pnpm start" --name "sami-analytics"

# حفظ الإعدادات
pm2 save

# تفعيل البدء التلقائي
pm2 startup
```

### 5. إعداد Nginx

```nginx
server {
    listen 80;
    server_name analytics.sami-pharmacy.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # تخزين مؤقت للملفات الثابتة
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SSL (اختياري)
    # listen 443 ssl;
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
}
```

### 6. إعادة تحميل Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 المراقبة والصيانة

### فحص حالة التطبيق

```bash
# عرض حالة PM2
pm2 status

# عرض السجلات
pm2 logs sami-analytics

# مراقبة الأداء
pm2 monit
```

### النسخ الاحتياطية

```bash
# نسخ احتياطية من قاعدة البيانات
mysqldump -u root -p sami_aumet > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة من نسخة احتياطية
mysql -u root -p sami_aumet < backup_20240101_120000.sql
```

### التحديثات

```bash
# سحب آخر التحديثات
git pull origin main

# تثبيت المكتبات الجديدة
pnpm install

# تشغيل الـ migrations
pnpm db:push

# إعادة تشغيل التطبيق
pm2 restart sami-analytics
```

## 🔐 الأمان

### متطلبات الأمان

1. **تفعيل SSL/TLS**
   ```bash
   # استخدام Let's Encrypt
   sudo certbot certonly --nginx -d analytics.sami-pharmacy.com
   ```

2. **تحديث كلمات المرور**
   - قاعدة البيانات
   - Odoo ERP
   - خادم الويب

3. **تفعيل جدار الحماية**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **تحديث النظام**
   ```bash
   sudo apt update
   sudo apt upgrade
   ```

## 📈 الأداء

### تحسينات الأداء

1. **تخزين مؤقت**
   - تفعيل Redis للجلسات
   - تخزين مؤقت للبيانات الثابتة

2. **ضغط البيانات**
   ```nginx
   gzip on;
   gzip_types text/plain text/css text/xml text/javascript application/json;
   ```

3. **CDN**
   - استخدام CDN للملفات الثابتة
   - توزيع جغرافي للمحتوى

### مراقبة الأداء

```bash
# استخدام New Relic أو DataDog
# npm install newrelic
```

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

| المشكلة | الحل |
|--------|------|
| خطأ الاتصال بقاعدة البيانات | تحقق من بيانات الاتصال في .env |
| خطأ CORS | تحقق من إعدادات CORS في server/index.ts |
| بطء التطبيق | تحقق من استخدام الموارد والقاعدة |
| خطأ الاتصال بـ Odoo | تحقق من URL وبيانات المصادقة |

### السجلات

```bash
# عرض سجلات التطبيق
pm2 logs sami-analytics

# عرض سجلات Nginx
sudo tail -f /var/log/nginx/error.log

# عرض سجلات النظام
sudo journalctl -u sami-analytics -f
```

## 📞 الدعم الفني

للمساعدة في النشر:
- البريد الإلكتروني: support@sami-pharmacy.com
- الهاتف: +966 XX XXX XXXX
- الموقع: https://sami-pharmacy.com/support

## ✅ قائمة التحقق النهائية

- [ ] تثبيت المكتبات
- [ ] إعداد قاعدة البيانات
- [ ] تعديل متغيرات البيئة
- [ ] بناء المشروع
- [ ] اختبار محلي
- [ ] إعداد الخادم
- [ ] نشر التطبيق
- [ ] إعداد Nginx
- [ ] تفعيل SSL
- [ ] اختبار الإنتاج
- [ ] إعداد المراقبة
- [ ] إعداد النسخ الاحتياطية

---

**آخر تحديث**: 11 نوفمبر 2024
**الإصدار**: 1.0.0
