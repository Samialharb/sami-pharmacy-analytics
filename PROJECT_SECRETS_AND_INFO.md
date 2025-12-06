# 🔐 معلومات مشروع Sami Aumet Analytics - سرية

> ⚠️ **تحذير:** هذا الملف يحتوي على معلومات حساسة جداً! احفظه في مكان آمن ولا تشاركه مع أحد!

---

## 📋 معلومات المشروع الأساسية

### اسم المشروع
**Sami Aumet Analytics** - صيدلية سامي - منصة التقارير والإحصائيات المتقدمة

### الوصف
منصة تحليلات احترافية متكاملة لعرض بيانات Odoo ERP من Supabase. تحتوي على:
- Dashboard رئيسية مع KPIs شاملة
- صفحة المبيعات (28,589 طلب)
- صفحة المنتجات (29,186 منتج)
- صفحة العملاء (4,909 عميل)
- صفحة المشتريات (1,263 طلب)
- صفحة الموردين
- صفحة المخزون

---

## 🌐 روابط المشروع

### GitHub Repository
```
https://github.com/Samialharb/sami-pharmacy-analytics.git
```

### Vercel (الإنتاج)
```
https://sami-pharmacy-analytics.vercel.app
```

### Manus Dev Server
```
https://3000-i1a8myuq7u2f8lu8rnw3b-ca6c2d3f.manus-asia.computer
```

---

## 🔑 بيانات Supabase (قاعدة البيانات)

### Supabase Project URL
```
https://zcpxhbqjqxvwgqpxbvdx.supabase.co
```

### Supabase Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcHhoYnFqcXh2d2dxcHhidmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NjM4NzAsImV4cCI6MjA0ODUzOTg3MH0.9w8tZYqOJlNqF3_WZxQJYqR5tZYqOJlNqF3_WZxQJYqR5
```

### Supabase Service Role Key (Private - خطير!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcHhoYnFqcXh2d2dxcHhidmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk2Mzg3MCwiZXhwIjoyMDQ4NTM5ODcwfQ.SERVICE_ROLE_KEY_HERE
```

> ⚠️ **ملاحظة:** Service Role Key يعطي صلاحيات كاملة على قاعدة البيانات! لا تشاركه أبداً!

### Database Connection String
```
postgresql://postgres.zcpxhbqjqxvwgqpxbvdx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 📊 معلومات قاعدة البيانات

### الجداول الرئيسية (من Odoo ERP)

| الجدول | عدد السجلات | الوصف |
|--------|-------------|--------|
| `pos_order` | 28,589 | طلبات المبيعات |
| `pos_order_line` | 52,551 | تفاصيل المنتجات المباعة |
| `product_product` | 29,186 | المنتجات |
| `product_template` | 29,186 | قوالب المنتجات |
| `res_partner` | 4,909 | العملاء والموردين |
| `purchase_order` | 1,263 | طلبات الشراء |
| `purchase_order_line` | 21,666 | تفاصيل المشتريات |
| `account_move` | ~10,000 | الفواتير |
| `stock_move` | ~30,000 | حركات المخزون |
| `stock_quant` | ~5,000 | كميات المخزون |

**إجمالي البيانات:** ~200,000 سجل

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 19** - مكتبة UI
- **TypeScript** - لغة البرمجة
- **Tailwind CSS 4** - التصميم
- **Vite** - Build tool
- **Wouter** - Routing
- **Lucide React** - الأيقونات

### Backend & Database
- **Supabase** - قاعدة البيانات (PostgreSQL)
- **Supabase Client** - للاتصال بقاعدة البيانات
- **Odoo ERP** - مصدر البيانات الأصلي

### Deployment
- **Vercel** - النشر والاستضافة
- **GitHub** - إدارة الكود
- **Manus** - بيئة التطوير

---

## 📁 هيكل المشروع

```
sami_aumet_analytics/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # صفحات التطبيق
│   │   │   ├── Dashboard.tsx        # Dashboard الرئيسية
│   │   │   ├── Sales.tsx            # صفحة المبيعات
│   │   │   ├── Products.tsx         # صفحة المنتجات
│   │   │   ├── Customers.tsx        # صفحة العملاء
│   │   │   ├── Purchases.tsx        # صفحة المشتريات
│   │   │   ├── Suppliers.tsx        # صفحة الموردين
│   │   │   └── Inventory.tsx        # صفحة المخزون
│   │   ├── components/              # مكونات UI
│   │   │   ├── Layout.tsx           # Layout الرئيسي
│   │   │   └── ui/                  # مكونات shadcn/ui
│   │   ├── lib/
│   │   │   └── supabase.ts          # Supabase client
│   │   ├── App.tsx                  # التوجيه الرئيسي
│   │   └── main.tsx                 # نقطة الدخول
│   ├── index.html
│   └── package.json
├── drizzle/                         # Database schema (غير مستخدم حالياً)
├── server/                          # Backend (غير مستخدم حالياً)
├── COMPLETE_DATABASE_ANALYSIS.md   # تحليل كامل لقاعدة البيانات
├── SUPABASE_ANALYSIS.md            # تحليل Supabase
├── todo.md                          # قائمة المهام
└── PROJECT_SECRETS_AND_INFO.md     # هذا الملف!
```

---

## 🚀 كيفية تشغيل المشروع محلياً

### 1. Clone المشروع من GitHub

```bash
git clone https://github.com/Samialharb/sami-pharmacy-analytics.git
cd sami-pharmacy-analytics
```

### 2. تثبيت Dependencies

```bash
cd client
npm install
# أو
pnpm install
```

### 3. إنشاء ملف `.env.local`

أنشئ ملف `client/.env.local` وأضف:

```env
VITE_SUPABASE_URL=https://zcpxhbqjqxvwgqpxbvdx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcHhoYnFqcXh2d2dxcHhidmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NjM4NzAsImV4cCI6MjA0ODUzOTg3MH0.9w8tZYqOJlNqF3_WZxQJYqR5tZYqOJlNqF3_WZxQJYqR5
```

### 4. تشغيل Dev Server

```bash
npm run dev
# أو
pnpm dev
```

الموقع سيعمل على: `http://localhost:5173`

---

## 📤 كيفية النشر على Vercel

### الطريقة الأولى: من GitHub (تلقائي)

1. **Push التحديثات إلى GitHub:**
   ```bash
   git add .
   git commit -m "تحديث المشروع"
   git push github main
   ```

2. **Vercel سيعمل deploy تلقائياً!**
   - Vercel متصل بـ GitHub Repository
   - أي push إلى `main` branch سيؤدي إلى deploy تلقائي
   - يمكنك متابعة التقدم من: https://vercel.com/dashboard

### الطريقة الثانية: من Vercel Dashboard

1. اذهب إلى: https://vercel.com/dashboard
2. اختر المشروع: `sami-pharmacy-analytics`
3. اضغط "Redeploy" لإعادة النشر يدوياً

---

## 🔧 Environment Variables على Vercel

تأكد من أن هذه المتغيرات موجودة في Vercel Settings:

```
VITE_SUPABASE_URL=https://zcpxhbqjqxvwgqpxbvdx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**كيفية إضافتها:**
1. اذهب إلى Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف المتغيرات
5. Redeploy المشروع

---

## 📝 ملاحظات مهمة للتطوير

### 1. صفحة المبيعات
- **الافتراضي:** شهري (نوفمبر 2025)
- **لا تعرض الإحصائيات الإجمالية** في الأعلى
- **تجلب 1,000 طلب** فقط افتراضياً (للأداء)
- **يمكن البحث** في أي شهر/سنة

### 2. Dashboard الرئيسية
- **تعرض البيانات الحقيقية** من Odoo ERP
- **29,186 منتج** (من `product_product`)
- **28,589 طلب** (من `pos_order`)
- **4,909 عميل** (من `res_partner`)

### 3. Supabase Client
- **الملف:** `client/src/lib/supabase.ts`
- **يستخدم الجداول الحقيقية** من Odoo ERP
- **جميع الدوال جاهزة** للاستخدام

### 4. الأداء
- **استخدم Pagination** للجداول الكبيرة
- **استخدم Filters** لتقليل البيانات المجلوبة
- **استخدم Indexes** في Supabase للاستعلامات السريعة

---

## 🐛 حل المشاكل الشائعة

### المشكلة: البيانات لا تظهر

**الحل:**
1. تأكد من أن Supabase URL و Key صحيحة
2. تأكد من أن الجداول موجودة في Supabase
3. افتح Browser Console وشف الأخطاء
4. تأكد من أن RLS (Row Level Security) معطّل أو مضبوط صح

### المشكلة: Vercel Deploy فشل

**الحل:**
1. تأكد من أن Environment Variables موجودة في Vercel
2. تأكد من أن Build Command صحيح: `cd client && npm run build`
3. تأكد من أن Output Directory صحيح: `client/dist`
4. شف Vercel Logs للأخطاء

### المشكلة: الموقع بطيء

**الحل:**
1. استخدم Pagination للجداول الكبيرة
2. استخدم Filters لتقليل البيانات
3. استخدم Indexes في Supabase
4. استخدم React.memo للمكونات الثقيلة

---

## 📞 معلومات الاتصال

### GitHub
- **Username:** Samialharb
- **Repository:** sami-pharmacy-analytics

### Vercel
- **Project:** sami-pharmacy-analytics
- **URL:** https://sami-pharmacy-analytics.vercel.app

### Supabase
- **Project:** zcpxhbqjqxvwgqpxbvdx
- **Region:** Southeast Asia (Singapore)

---

## 📅 آخر تحديث

**التاريخ:** 30 نوفمبر 2025
**الوقت:** 09:15:42 (EST)
**Commit:** `6c5df6c` - "تحسينات صفحة المبيعات (بناءً على طلب المستخدم)"

---

## ✅ الميزات المكتملة

- [x] تحليل قاعدة البيانات الكامل (53 جدول)
- [x] اكتشاف البيانات الحقيقية (~200,000 سجل)
- [x] إنشاء Supabase client محسّن
- [x] Dashboard رئيسية مع KPIs شاملة
- [x] صفحة المبيعات (28,589 طلب)
- [x] فلاتر متقدمة (يومي، شهري، سنوي)
- [x] خيارات التصدير (Excel, PDF)
- [x] تحسين الأداء (جلب شهر واحد فقط افتراضياً)
- [x] النشر على Vercel

---

## 🔮 الميزات المستقبلية

- [ ] صفحة المنتجات (29,186 منتج)
- [ ] صفحة العملاء (4,909 عميل)
- [ ] صفحة المشتريات (1,263 طلب)
- [ ] صفحة الموردين
- [ ] صفحة المخزون
- [ ] Pagination للجداول الكبيرة
- [ ] بحث متقدم
- [ ] تصدير جميع البيانات
- [ ] تقارير مخصصة
- [ ] إشعارات

---

## 🔐 أمان المعلومات

> ⚠️ **تذكير مهم:**
> - **لا تشارك** هذا الملف مع أحد!
> - **لا ترفعه** إلى GitHub أو أي مكان عام!
> - **احفظه** في مكان آمن ومشفر!
> - **استخدم** Environment Variables بدلاً من hardcoding المفاتيح!

---

**🎉 بالتوفيق في تطوير المشروع!**
