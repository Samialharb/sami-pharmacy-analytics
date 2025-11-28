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

#### Secret 5: ODOO_UID
```
Name: ODOO_UID
Value: 7
```

#### Secret 6: SUPABASE_URL
```
Name: SUPABASE_URL
Value: https://ajcbqdlpovpxbzltbjfl.supabase.co
```

#### Secret 7: SUPABASE_KEY
```
Name: SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIyNzQ4NCwiZXhwIjoyMDc3ODAzNDg0fQ.H3zxYiUlJSrsJPzar7eXk6JgocPNs76ABMbSBUtbGXg
```

---

## 3. التحقق من الإضافة

بعد إضافة جميع الـ Secrets، يجب أن تشاهد 7 secrets في القائمة:
- ✅ ODOO_URL
- ✅ ODOO_DB
- ✅ ODOO_USERNAME
- ✅ ODOO_PASSWORD
- ✅ ODOO_UID
- ✅ SUPABASE_URL
- ✅ SUPABASE_KEY

---

## 4. اختبار الـ Workflow

بعد إضافة الـ Secrets، يمكنك اختبار الـ workflow يدوياً:

1. افتح: https://github.com/Samialharb/sami-pharmacy-analytics/actions
2. اختر "Sync Aumet ERP to Supabase"
3. اضغط "Run workflow"
4. اختر branch "main"
5. اضغط "Run workflow"

---

## 5. المزامنة التلقائية

بعد إضافة الـ Secrets، الـ workflow سيعمل تلقائياً:
- ⏰ **كل 6 ساعات** (في الساعة 12:00 AM, 6:00 AM, 12:00 PM, 6:00 PM UTC)
- 🔄 يجلب أحدث البيانات من Aumet ERP
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
