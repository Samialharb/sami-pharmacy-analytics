# 🔐 إعداد GitHub Secrets للمزامنة التلقائية

## الخطوات:

### 1. افتح صفحة Secrets في GitHub
افتح الرابط التالي:
```
https://github.com/Samialharb/sami-pharmacy-analytics/settings/secrets/actions
```

### 2. أضف كل Secret من القائمة التالية

اضغط على **"New repository secret"** لكل واحد:

#### Secret 1: ODOO_URL
```
Name: ODOO_URL
Value: https://health-path.erp-ksa.aumet.com
```

#### Secret 2: ODOO_DB
```
Name: ODOO_DB
Value: health-path.erp-ksa.aumet.com
```

#### Secret 3: ODOO_USERNAME
```
Name: ODOO_USERNAME
Value: sami@aumet.com
```

#### Secret 4: ODOO_PASSWORD
```
Name: ODOO_PASSWORD
Value: Sami@1212
```

#### Secret 5: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ajcbqdlpovpxbzltbjfl.supabase.co
```

#### Secret 6: SUPABASE_SERVICE_ROLE_KEY
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzA0NzI3MCwiZXhwIjoxNzE5NjI5MjcwfQ.3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA
```

---

## 3. التحقق من الإضافة

بعد إضافة جميع الـ Secrets، يجب أن تشاهد 6 secrets في القائمة:
- ✅ ODOO_URL
- ✅ ODOO_DB
- ✅ ODOO_USERNAME
- ✅ ODOO_PASSWORD
- ✅ SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY

---

## 4. اختبار الـ Workflow

بعد إضافة الـ Secrets، يمكنك اختبار الـ workflow يدوياً:

1. افتح: https://github.com/Samialharb/sami-pharmacy-analytics/actions
2. اختر "🔄 Sync Odoo Data to Supabase"
3. اضغط "Run workflow"
4. اختر branch "main"
5. اضغط "Run workflow"

---

## 5. المزامنة التلقائية

بعد إضافة الـ Secrets، الـ workflow سيعمل تلقائياً:
- ⏰ **يومياً الساعة 2 صباحاً** (UTC+3)
- 🔄 يجلب أحدث البيانات من Odoo ERP
- 📊 يحدث Supabase تلقائياً
- 📧 يرسل إشعار بالنجاح أو الفشل

---

## ملاحظات:

⚠️ **لا تشارك هذه البيانات مع أحد!**
- الـ Secrets تحتوي على بيانات دخول حساسة
- GitHub يخفيها تلقائياً في Logs

✅ **الـ Workflow جاهز الآن!**
- بعد إضافة الـ Secrets، كل شيء سيعمل تلقائياً
- لن تحتاج تشغيل السكريبت يدوياً بعد الآن
