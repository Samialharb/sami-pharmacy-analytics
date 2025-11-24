-- ===================================================
-- SQL لإنشاء جداول Supabase - صيدلية سامي
-- ===================================================

-- 1. جدول العملاء
CREATE TABLE IF NOT EXISTS aumet_customers (
    id BIGSERIAL PRIMARY KEY,
    customer_id INTEGER UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT,
    country TEXT,
    customer_rank INTEGER DEFAULT 0,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_customers_name ON aumet_customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customers_id ON aumet_customers(customer_id);

-- ===================================================

-- 2. جدول المنتجات
CREATE TABLE IF NOT EXISTS aumet_products (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    product_code TEXT,
    sale_price DECIMAL(10, 2) DEFAULT 0,
    cost_price DECIMAL(10, 2) DEFAULT 0,
    category TEXT DEFAULT 'غير مصنف',
    qty_available DECIMAL(10, 2) DEFAULT 0,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_products_name ON aumet_products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_id ON aumet_products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON aumet_products(category);

-- ===================================================

-- 3. جدول المخزون
CREATE TABLE IF NOT EXISTS aumet_inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    location TEXT DEFAULT 'غير محدد',
    quantity DECIMAL(10, 2) DEFAULT 0,
    reserved_quantity DECIMAL(10, 2) DEFAULT 0,
    available_quantity DECIMAL(10, 2) DEFAULT 0,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON aumet_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_name ON aumet_inventory(product_name);

-- ===================================================

-- 4. التحقق من جدول المبيعات الموجود وتحديثه إذا لزم الأمر
-- (الجدول موجود بالفعل لكن نتأكد من البنية)

-- إضافة أعمدة جديدة إذا لم تكن موجودة
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='aumet_sales_orders' AND column_name='salesperson_id') THEN
        ALTER TABLE aumet_sales_orders ADD COLUMN salesperson_id INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='aumet_sales_orders' AND column_name='salesperson_name') THEN
        ALTER TABLE aumet_sales_orders ADD COLUMN salesperson_name TEXT;
    END IF;
END $$;

-- ===================================================

-- 5. جدول المشتريات (للمستقبل)
CREATE TABLE IF NOT EXISTS aumet_purchases (
    id BIGSERIAL PRIMARY KEY,
    purchase_id INTEGER UNIQUE NOT NULL,
    purchase_name TEXT NOT NULL,
    supplier_id INTEGER,
    supplier_name TEXT,
    purchase_date TIMESTAMP WITH TIME ZONE,
    amount_total DECIMAL(10, 2) DEFAULT 0,
    state TEXT DEFAULT 'draft',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_id ON aumet_purchases(purchase_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON aumet_purchases(supplier_id);

-- ===================================================

-- 6. جدول الموردين (للمستقبل)
CREATE TABLE IF NOT EXISTS aumet_suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_id INTEGER UNIQUE NOT NULL,
    supplier_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    city TEXT,
    country TEXT,
    supplier_rank INTEGER DEFAULT 0,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON aumet_suppliers(supplier_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_id ON aumet_suppliers(supplier_id);

-- ===================================================

-- 7. جدول الفواتير (للمستقبل)
CREATE TABLE IF NOT EXISTS aumet_invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_id INTEGER UNIQUE NOT NULL,
    invoice_name TEXT NOT NULL,
    partner_id INTEGER,
    partner_name TEXT,
    invoice_date TIMESTAMP WITH TIME ZONE,
    amount_total DECIMAL(10, 2) DEFAULT 0,
    state TEXT DEFAULT 'draft',
    invoice_type TEXT DEFAULT 'out_invoice',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_id ON aumet_invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_partner ON aumet_invoices(partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type ON aumet_invoices(invoice_type);

-- ===================================================

-- تفعيل Row Level Security (RLS) للأمان
ALTER TABLE aumet_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aumet_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE aumet_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE aumet_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE aumet_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE aumet_invoices ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات للقراءة العامة (يمكن تعديلها حسب الحاجة)
CREATE POLICY "Enable read access for all users" ON aumet_customers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aumet_products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aumet_inventory FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aumet_purchases FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aumet_suppliers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON aumet_invoices FOR SELECT USING (true);

-- ===================================================

-- عرض ملخص الجداول
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name LIKE 'aumet_%'
ORDER BY table_name;

-- ===================================================
-- انتهى
-- ===================================================
