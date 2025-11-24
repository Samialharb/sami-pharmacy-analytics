#!/usr/bin/env python3
"""
سكريبت بسيط للتحقق من عدد sale.order في Odoo
"""

import xmlrpc.client
import os

# قراءة المتغيرات البيئية يدوياً
def load_env_file(filepath):
    env_vars = {}
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip().strip('"').strip("'")
    return env_vars

env = load_env_file('.env.sync')

# بيانات الاتصال
ODOO_URL = env.get('ODOO_URL')
ODOO_DB = env.get('ODOO_DB')
ODOO_USERNAME = env.get('ODOO_USERNAME')
ODOO_PASSWORD = env.get('ODOO_PASSWORD')

print("=" * 60)
print("🔍 التحقق من عدد sale.order في Odoo")
print("=" * 60)
print(f"📍 URL: {ODOO_URL}")
print(f"📍 Database: {ODOO_DB}")
print(f"📍 Username: {ODOO_USERNAME}")
print("=" * 60)

# الاتصال بـ Odoo
common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')

# المصادقة
print("\n🔐 المصادقة...")
uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
print(f"✅ تم تسجيل الدخول بنجاح! UID: {uid}")

# 1. استخدام search_count للحصول على العدد الكلي
print("\n" + "=" * 60)
print("📊 الطريقة 1: استخدام search_count")
print("=" * 60)

total_count = models.execute_kw(
    ODOO_DB, uid, ODOO_PASSWORD,
    'sale.order', 'search_count',
    [[]]  # بدون فلاتر = جميع الطلبات
)
print(f"✅ العدد الكلي لـ sale.order: {total_count:,} طلب")

# 2. استخدام search مع limit كبير
print("\n" + "=" * 60)
print("📊 الطريقة 2: استخدام search مع limit=100000")
print("=" * 60)

order_ids = models.execute_kw(
    ODOO_DB, uid, ODOO_PASSWORD,
    'sale.order', 'search',
    [[]],
    {'limit': 100000}
)
print(f"✅ عدد IDs المرجعة: {len(order_ids):,} طلب")

# 3. استخدام search بدون limit
print("\n" + "=" * 60)
print("📊 الطريقة 3: استخدام search بدون limit")
print("=" * 60)

order_ids_no_limit = models.execute_kw(
    ODOO_DB, uid, ODOO_PASSWORD,
    'sale.order', 'search',
    [[]]
)
print(f"✅ عدد IDs المرجعة: {len(order_ids_no_limit):,} طلب")

# 4. عرض أول 5 IDs
print("\n" + "=" * 60)
print("📋 أول 5 IDs من sale.order:")
print("=" * 60)
for i, order_id in enumerate(order_ids[:5], 1):
    print(f"{i}. Order ID: {order_id}")

# 5. جلب تفاصيل أول طلب
print("\n" + "=" * 60)
print("📄 تفاصيل أول طلب:")
print("=" * 60)

if order_ids:
    first_order = models.execute_kw(
        ODOO_DB, uid, ODOO_PASSWORD,
        'sale.order', 'read',
        [order_ids[:1]],
        {'fields': ['id', 'name', 'partner_id', 'amount_total', 'state', 'date_order']}
    )
    
    if first_order:
        order = first_order[0]
        print(f"ID: {order['id']}")
        print(f"Name: {order.get('name', 'N/A')}")
        print(f"Partner ID: {order.get('partner_id', 'N/A')}")
        print(f"Amount Total: {order.get('amount_total', 0)}")
        print(f"State: {order.get('state', 'N/A')}")
        print(f"Date Order: {order.get('date_order', 'N/A')}")

print("\n" + "=" * 60)
print("✅ انتهى الفحص!")
print("=" * 60)
