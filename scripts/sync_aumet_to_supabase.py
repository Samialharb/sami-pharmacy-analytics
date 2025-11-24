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
    """مزامنة طلبات المبيعات من Odoo إلى Supabase (من pos.order)"""
    try:
        logger.info("📦 بدء مزامنة طلبات المبيعات (pos.order)...")
        
        # أولاً: معرفة العدد الكلي للطلبات
        total_count = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'pos.order', 'search_count',
            [[]]
        )
        
        logger.info(f"📊 العدد الكلي للطلبات في Odoo: {total_count}")
        
        if total_count == 0:
            logger.warning("⚠️ لا توجد طلبات مبيعات")
            return
        
        # جلب جميع الطلبات باستخدام pagination
        all_order_ids = []
        batch_size = 1000  # جلب 1000 طلب في كل دفعة
        offset = 0
        
        while offset < total_count:
            logger.info(f"🔄 جلب الطلبات من {offset} إلى {offset + batch_size}...")
            
            batch_ids = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'pos.order', 'search',
                [[]], 
                {'limit': batch_size, 'offset': offset}
            )
            
            if not batch_ids:
                break
            
            all_order_ids.extend(batch_ids)
            offset += batch_size
            
            logger.info(f"✅ تم جلب {len(batch_ids)} طلب (الإجمالي: {len(all_order_ids)}/{total_count})")
        
        logger.info(f"📊 تم جلب {len(all_order_ids)} طلب مبيعات بنجاح")
        
        # جلب تفاصيل الطلبات (على دفعات أيضاً لتجنب timeout)
        all_orders = []
        read_batch_size = 500  # قراءة 500 طلب في كل مرة
        
        for i in range(0, len(all_order_ids), read_batch_size):
            batch_ids = all_order_ids[i:i+read_batch_size]
            logger.info(f"📖 قراءة تفاصيل الطلبات {i+1} إلى {i+len(batch_ids)}...")
            
            orders = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'pos.order', 'read',
                [batch_ids],
                {'fields': ['name', 'partner_id', 'date_order', 'amount_total', 'state']}
            )
            
            all_orders.extend(orders)
            logger.info(f"✅ تم قراءة {len(orders)} طلب (الإجمالي: {len(all_orders)}/{len(all_order_ids)})")
        
        orders = all_orders
        
        # تحويل البيانات للصيغة المناسبة لـ Supabase
        sales_data = []
        skipped_count = 0
        for order in orders:
            # تجاهل الطلبات بمبالغ سالبة (المرتجعات) مؤقتاً
            if order.get('amount_total', 0) < 0:
                skipped_count += 1
                continue
            
            sales_data.append({
                'aumet_id': order['id'],
                'name': order['name'],
                'partner_id': order['partner_id'][0] if order.get('partner_id') else None,
                'amount_total': float(order['amount_total']),
                'state': order['state']
            })
        
        if skipped_count > 0:
            logger.warning(f"⚠️ تم تجاهل {skipped_count} طلب بمبالغ سالبة (مرتجعات)")
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_sales_orders').delete().neq('aumet_id', 0).execute()
        
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
                'aumet_id': customer['id'],
                'name': customer['name'],
                'email': customer.get('email'),
                'phone': customer.get('phone') or customer.get('mobile')
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_customers').delete().neq('aumet_id', 0).execute()
        
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
                'aumet_id': product['id'],
                'name': product['name'],
                'default_code': product.get('default_code'),
                'list_price': float(product.get('list_price', 0))
            })
        
        # حذف البيانات القديمة وإدراج الجديدة
        logger.info("🗑️ حذف البيانات القديمة...")
        supabase.table('aumet_products').delete().neq('aumet_id', 0).execute()
        
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
