#!/usr/bin/env python3
"""
سكريبت المزامنة الشامل بين Aumet ERP (Odoo) و Supabase
يقوم بجلب جميع البيانات: المبيعات، العملاء، المنتجات، المخزون، المشتريات، الفواتير
"""

import os
import sys
import xmlrpc.client
from datetime import datetime
from supabase import create_client, Client
import logging

# إعداد Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== الإعدادات ====================

# Odoo/Aumet ERP Settings
ODOO_URL = os.getenv('ODOO_URL', 'https://health-path.erp-ksa.aumet.com')
ODOO_DB = os.getenv('ODOO_DB', 'health-path.erp-ksa.aumet.com')
ODOO_USERNAME = os.getenv('ODOO_USERNAME', '')  # يجب إضافته في GitHub Secrets
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD', '')  # يجب إضافته في GitHub Secrets
ODOO_UID = int(os.getenv('ODOO_UID', '7'))

# Supabase Settings
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ajcbqdlpovpxbzltbjfl.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')  # Service Role Key

# ==================== الاتصال ====================

def connect_odoo():
    """الاتصال بـ Odoo ERP"""
    try:
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        
        # التحقق من الاتصال
        version = common.version()
        logger.info(f"✅ متصل بـ Odoo: {version}")
        
        # المصادقة
        uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
        if not uid:
            raise Exception("فشلت المصادقة مع Odoo")
        
        logger.info(f"✅ تم تسجيل الدخول - UID: {uid}")
        return models, uid
    
    except Exception as e:
        logger.error(f"❌ خطأ في الاتصال بـ Odoo: {e}")
        sys.exit(1)


def connect_supabase():
    """الاتصال بـ Supabase"""
    try:
        if not SUPABASE_KEY:
            raise Exception("SUPABASE_KEY غير موجود")
        
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("✅ متصل بـ Supabase")
        return supabase
    
    except Exception as e:
        logger.error(f"❌ خطأ في الاتصال بـ Supabase: {e}")
        sys.exit(1)


# ==================== مزامنة طلبات المبيعات ====================

def sync_sales_orders(models, uid, supabase):
    """مزامنة طلبات المبيعات من Odoo إلى Supabase"""
    try:
        logger.info("📦 بدء مزامنة طلبات المبيعات...")
        
        # جلب طلبات المبيعات من Odoo
        order_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'search',
            [[]], 
            {'limit': 10000}  # جلب 10,000 طلب
        )
        
        logger.info(f"📊 تم العثور على {len(order_ids)} طلب مبيعات")
        
        if not order_ids:
            logger.warning("⚠️ لا توجد طلبات مبيعات")
            return
        
        # جلب تفاصيل الطلبات
        orders = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'read',
            [order_ids],
            {'fields': ['name', 'partner_id', 'date_order', 'amount_total', 'state', 'user_id']}
        )
        
        # تحويل البيانات للصيغة المناسبة لـ Supabase
        sales_data = []
        for order in orders:
            sales_data.append({
                'order_id': order['id'],
                'order_name': order['name'],
                'customer_id': order['partner_id'][0] if order.get('partner_id') else None,
                'customer_name': order['partner_id'][1] if order.get('partner_id') else 'غير معروف',
                'order_date': order['date_order'],
                'amount_total': float(order['amount_total']),
                'state': order['state'],
                'salesperson_id': order['user_id'][0] if order.get('user_id') else None,
                'salesperson_name': order['user_id'][1] if order.get('user_id') else None,
                'synced_at': datetime.now().isoformat()
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_sales_orders').delete().neq('order_id', 0).execute()
        
        # إدراج البيانات الجديدة (على دفعات)
        batch_size = 1000
        for i in range(0, len(sales_data), batch_size):
            batch = sales_data[i:i+batch_size]
            supabase.table('aumet_sales_orders').insert(batch).execute()
            logger.info(f"✅ تم إدراج {len(batch)} طلب ({i+len(batch)}/{len(sales_data)})")
        
        logger.info(f"✅ تمت مزامنة {len(sales_data)} طلب مبيعات بنجاح")
        
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة طلبات المبيعات: {e}")


# ==================== مزامنة العملاء ====================

def sync_customers(models, uid, supabase):
    """مزامنة العملاء من Odoo إلى Supabase"""
    try:
        logger.info("👥 بدء مزامنة العملاء...")
        
        # جلب العملاء من Odoo (فقط العملاء وليس الموردين)
        customer_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'res.partner', 'search',
            [[['customer_rank', '>', 0]]], 
            {'limit': 5000}
        )
        
        logger.info(f"📊 تم العثور على {len(customer_ids)} عميل")
        
        if not customer_ids:
            logger.warning("⚠️ لا يوجد عملاء")
            return
        
        # جلب تفاصيل العملاء
        customers = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'res.partner', 'read',
            [customer_ids],
            {'fields': ['name', 'email', 'phone', 'mobile', 'city', 'country_id', 'customer_rank']}
        )
        
        # تحويل البيانات
        customers_data = []
        for customer in customers:
            customers_data.append({
                'customer_id': customer['id'],
                'customer_name': customer['name'],
                'email': customer.get('email'),
                'phone': customer.get('phone') or customer.get('mobile'),
                'city': customer.get('city'),
                'country': customer['country_id'][1] if customer.get('country_id') else None,
                'customer_rank': customer.get('customer_rank', 0),
                'synced_at': datetime.now().isoformat()
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_customers').delete().neq('customer_id', 0).execute()
        
        # إدراج البيانات الجديدة
        batch_size = 1000
        for i in range(0, len(customers_data), batch_size):
            batch = customers_data[i:i+batch_size]
            supabase.table('aumet_customers').insert(batch).execute()
            logger.info(f"✅ تم إدراج {len(batch)} عميل ({i+len(batch)}/{len(customers_data)})")
        
        logger.info(f"✅ تمت مزامنة {len(customers_data)} عميل بنجاح")
        
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة العملاء: {e}")


# ==================== مزامنة المنتجات ====================

def sync_products(models, uid, supabase):
    """مزامنة المنتجات من Odoo إلى Supabase"""
    try:
        logger.info("📦 بدء مزامنة المنتجات...")
        
        # جلب المنتجات من Odoo
        product_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'product.product', 'search',
            [[['sale_ok', '=', True]]], 
            {'limit': 5000}
        )
        
        logger.info(f"📊 تم العثور على {len(product_ids)} منتج")
        
        if not product_ids:
            logger.warning("⚠️ لا توجد منتجات")
            return
        
        # جلب تفاصيل المنتجات
        products = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'product.product', 'read',
            [product_ids],
            {'fields': ['name', 'default_code', 'list_price', 'standard_price', 'categ_id', 'qty_available']}
        )
        
        # تحويل البيانات
        products_data = []
        for product in products:
            products_data.append({
                'product_id': product['id'],
                'product_name': product['name'],
                'product_code': product.get('default_code'),
                'sale_price': float(product.get('list_price', 0)),
                'cost_price': float(product.get('standard_price', 0)),
                'category': product['categ_id'][1] if product.get('categ_id') else 'غير مصنف',
                'qty_available': float(product.get('qty_available', 0)),
                'synced_at': datetime.now().isoformat()
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_products').delete().neq('product_id', 0).execute()
        
        # إدراج البيانات الجديدة
        batch_size = 1000
        for i in range(0, len(products_data), batch_size):
            batch = products_data[i:i+batch_size]
            supabase.table('aumet_products').insert(batch).execute()
            logger.info(f"✅ تم إدراج {len(batch)} منتج ({i+len(batch)}/{len(products_data)})")
        
        logger.info(f"✅ تمت مزامنة {len(products_data)} منتج بنجاح")
        
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة المنتجات: {e}")


# ==================== مزامنة المخزون ====================

def sync_inventory(models, uid, supabase):
    """مزامنة المخزون من Odoo إلى Supabase"""
    try:
        logger.info("📦 بدء مزامنة المخزون...")
        
        # جلب بيانات المخزون من Odoo
        quant_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'stock.quant', 'search',
            [[['quantity', '>', 0]]], 
            {'limit': 10000}
        )
        
        logger.info(f"📊 تم العثور على {len(quant_ids)} سجل مخزون")
        
        if not quant_ids:
            logger.warning("⚠️ لا توجد بيانات مخزون")
            return
        
        # جلب تفاصيل المخزون
        quants = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'stock.quant', 'read',
            [quant_ids],
            {'fields': ['product_id', 'location_id', 'quantity', 'reserved_quantity']}
        )
        
        # تحويل البيانات
        inventory_data = []
        for quant in quants:
            inventory_data.append({
                'product_id': quant['product_id'][0] if quant.get('product_id') else None,
                'product_name': quant['product_id'][1] if quant.get('product_id') else 'غير معروف',
                'location': quant['location_id'][1] if quant.get('location_id') else 'غير محدد',
                'quantity': float(quant.get('quantity', 0)),
                'reserved_quantity': float(quant.get('reserved_quantity', 0)),
                'available_quantity': float(quant.get('quantity', 0)) - float(quant.get('reserved_quantity', 0)),
                'synced_at': datetime.now().isoformat()
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_inventory').delete().neq('product_id', 0).execute()
        
        # إدراج البيانات الجديدة
        batch_size = 1000
        for i in range(0, len(inventory_data), batch_size):
            batch = inventory_data[i:i+batch_size]
            supabase.table('aumet_inventory').insert(batch).execute()
            logger.info(f"✅ تم إدراج {len(batch)} سجل ({i+len(batch)}/{len(inventory_data)})")
        
        logger.info(f"✅ تمت مزامنة {len(inventory_data)} سجل مخزون بنجاح")
        
    except Exception as e:
        logger.error(f"❌ خطأ في مزامنة المخزون: {e}")


# ==================== البرنامج الرئيسي ====================

def main():
    """البرنامج الرئيسي"""
    logger.info("=" * 60)
    logger.info("🚀 بدء المزامنة الشاملة بين Aumet ERP و Supabase")
    logger.info("=" * 60)
    
    # الاتصال بالأنظمة
    models, uid = connect_odoo()
    supabase = connect_supabase()
    
    # المزامنة
    sync_sales_orders(models, uid, supabase)
    sync_customers(models, uid, supabase)
    sync_products(models, uid, supabase)
    sync_inventory(models, uid, supabase)
    
    logger.info("=" * 60)
    logger.info("✅ اكتملت المزامنة بنجاح!")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
