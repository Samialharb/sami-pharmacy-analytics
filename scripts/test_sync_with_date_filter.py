"""
سكريبت اختبار لجلب طلبات المبيعات بفلتر زمني أوسع
"""

import os
import xmlrpc.client
from datetime import datetime, timedelta
import logging

# إعداد Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Odoo Settings
ODOO_URL = os.getenv('ODOO_URL', 'https://health-path.erp-ksa.aumet.com')
ODOO_DB = os.getenv('ODOO_DB', 'health-path.erp-ksa.aumet.com')
ODOO_USERNAME = os.getenv('ODOO_USERNAME', '')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD', '')

def test_fetch_orders():
    """اختبار جلب الطلبات بفلاتر مختلفة"""
    try:
        logger.info("🔗 الاتصال بـ Odoo...")
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
        
        # المصادقة
        uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
        if not uid:
            logger.error("❌ فشلت المصادقة")
            return
        
        logger.info(f"✅ تم تسجيل الدخول - UID: {uid}")
        
        # اختبار 1: جلب جميع الطلبات بدون فلتر
        logger.info("\n📊 اختبار 1: جلب جميع الطلبات...")
        all_order_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'search',
            [[]], 
            {}
        )
        logger.info(f"   عدد الطلبات: {len(all_order_ids)}")
        
        # اختبار 2: جلب طلبات آخر سنة
        logger.info("\n📊 اختبار 2: جلب طلبات آخر سنة...")
        one_year_ago = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        year_order_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'search',
            [[['date_order', '>=', one_year_ago]]], 
            {}
        )
        logger.info(f"   عدد الطلبات: {len(year_order_ids)}")
        logger.info(f"   من تاريخ: {one_year_ago}")
        
        # اختبار 3: جلب طلبات آخر 6 أشهر
        logger.info("\n📊 اختبار 3: جلب طلبات آخر 6 أشهر...")
        six_months_ago = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
        six_month_order_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'search',
            [[['date_order', '>=', six_months_ago]]], 
            {}
        )
        logger.info(f"   عدد الطلبات: {len(six_month_order_ids)}")
        logger.info(f"   من تاريخ: {six_months_ago}")
        
        # اختبار 4: جلب طلبات آخر 3 أشهر
        logger.info("\n📊 اختبار 4: جلب طلبات آخر 3 أشهر...")
        three_months_ago = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
        three_month_order_ids = models.execute_kw(
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order', 'search',
            [[['date_order', '>=', three_months_ago]]], 
            {}
        )
        logger.info(f"   عدد الطلبات: {len(three_month_order_ids)}")
        logger.info(f"   من تاريخ: {three_months_ago}")
        
        # جلب تفاصيل أول 5 طلبات للتحقق
        if all_order_ids[:5]:
            logger.info("\n📋 تفاصيل أول 5 طلبات:")
            sample_orders = models.execute_kw(
                ODOO_DB, uid, ODOO_PASSWORD,
                'sale.order', 'read',
                [all_order_ids[:5]],
                {'fields': ['name', 'date_order', 'amount_total', 'state']}
            )
            for order in sample_orders:
                logger.info(f"   - {order['name']}: {order['date_order']} | {order['amount_total']} | {order['state']}")
        
        logger.info("\n✅ اكتمل الاختبار!")
        
    except Exception as e:
        logger.error(f"❌ خطأ: {e}")

if __name__ == "__main__":
    test_fetch_orders()
