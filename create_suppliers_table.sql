-- إنشاء جدول الموردين (Suppliers)
CREATE TABLE IF NOT EXISTS aumet_suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    aumet_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    street VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    is_supplier BOOLEAN DEFAULT true,
    total_purchases NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_suppliers_aumet_id ON aumet_suppliers(aumet_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON aumet_suppliers(name);

-- تعليق على الجدول
COMMENT ON TABLE aumet_suppliers IS 'جدول الموردين من نظام Aumet ERP';
