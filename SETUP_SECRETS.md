# إعداد GitHub Secrets

لتفعيل المزامنة التلقائية بين Odoo و Supabase، تحتاج إلى إضافة Secrets إلى مستودعك على GitHub.

## الخطوات:

### 1. اذهب إلى إعدادات المستودع
```
https://github.com/samialharb/samiaumet/settings/secrets/actions
```

### 2. أضف الـ Secrets التالية:

#### Secret 1: ODOO_URL
- **Name**: `ODOO_URL`
- **Value**: `https://health-path.erp-ksa.aumet.com`

#### Secret 2: ODOO_DB
- **Name**: `ODOO_DB`
- **Value**: `health-path`

#### Secret 3: ODOO_USERNAME
- **Name**: `ODOO_USERNAME`
- **Value**: `sami@aumet.com`

#### Secret 4: ODOO_PASSWORD
- **Name**: `ODOO_PASSWORD`
- **Value**: `Sami@1212`

#### Secret 5: SUPABASE_URL
- **Name**: `SUPABASE_URL`
- **Value**: `https://ajcbqdlpovpxbzltbjfl.supabase.co`

#### Secret 6: SUPABASE_KEY
- **Name**: `SUPABASE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA`

### 3. لكل Secret:
1. انقر على "New repository secret"
2. أدخل الاسم والقيمة
3. انقر "Add secret"

## التحقق من الإعداد:

بعد إضافة جميع الـ Secrets:

1. اذهب إلى **Actions** في المستودع
2. اختر **"Sync Odoo to Supabase"**
3. انقر **"Run workflow"**
4. شاهد السجلات لتأكد من النجاح

## الجدول الزمني:

- ✅ المزامنة تعمل **تلقائياً كل ساعة**
- ✅ يمكنك تشغيلها يدوياً أي وقت
- ✅ البيانات تُحدّث من آخر 90 يوم

## استكشاف الأخطاء:

### المشكلة: "Secret not found"
- تأكد من إضافة جميع 6 Secrets
- تحقق من أسماء الـ Secrets (حالة الأحرف مهمة)

### المشكلة: فشل المزامنة
- تحقق من سجلات GitHub Actions
- تأكد من صحة بيانات Odoo و Supabase
- جرب التشغيل اليدوي لرؤية الأخطاء

## المزيد من المعلومات:

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Sync Script README](./scripts/README.md)
