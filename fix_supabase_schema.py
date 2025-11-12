#!/usr/bin/env python3
"""
سكريبت لإصلاح Schema في Supabase
"""

import os
from supabase import create_client

# بيانات الاتصال
SUPABASE_URL = "https://ajcbqdlpovpxbzltbjfl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIyNzQ4NCwiZXhwIjoyMDc3ODAzNDg0fQ.H3zxYiUlJSrsJPzar7eXk6JgocPNs76ABMbSBUtbGXg"

print("=" * 60)
print("🔧 إصلاح Schema في Supabase")
print("=" * 60)

# الاتصال بـ Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# 1. حذف constraint للسماح بالمبالغ السالبة (المرتجعات)
print("\n1️⃣ إصلاح constraint في aumet_sales_orders...")
try:
    result = supabase.rpc('exec_sql', {
        'query': '''
        ALTER TABLE aumet_sales_orders 
        DROP CONSTRAINT IF EXISTS aumet_sales_orders_amount_positive;
        '''
    }).execute()
    print("✅ تم حذف constraint بنجاح")
except Exception as e:
    print(f"⚠️ خطأ (قد يكون طبيعي): {e}")

print("\n" + "=" * 60)
print("✅ انتهى الإصلاح!")
print("=" * 60)
