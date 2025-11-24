#!/usr/bin/env python3
"""
سكريبت مزامنة الموردين من Odoo إلى Supabase
"""

import xmlrpc.client
import os
from supabase import create_client, Client

# قراءة بيانات الاتصال من Environment Variables
ODOO_URL = os.getenv('ODOO_URL', 'https://health-path.erp-ksa.aumet.com')
ODOO_DB = os.getenv('ODOO_DB', 'health-path')
ODOO_USERNAME = os.getenv('ODOO_USERNAME')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD')

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ajcbqdlpovpxbzltbjfl.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def connect_odoo():
    """الاتصال بـ Odoo"""
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {})
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object')
    return uid, models

def get_suppliers(uid, models):
    """جلب بيانات الموردين من Odoo"""
    print("🔄 جلب بيانات الموردين من Odoo...")
    
    # البحث عن الموردين (res.partner مع is_supplier=True)
    supplier_ids = models.execute_kw(
        ODOO_DB, uid, ODOO_PASSWORD,
        'res.partner', 'search',
        [[['supplier_rank', '>', 0]]]  # الموردين فقط
    )
    
    print(f"📊 عدد الموردين: {len(supplier_ids)}")
    
    if not supplier_ids:
        print("⚠️ لم يتم العثور على موردين!")
        return []
    
    # جلب تفاصيل الموردين
    suppliers = models.execute_kw(
        ODOO_DB, uid, ODOO_PASSWORD,
        'res.partner', 'read',
        [supplier_ids],
        {'fields': ['id', 'name', 'email', 'phone', 'mobile', 'street', 'city', 'country_id']}
    )
    
    return suppliers

def sync_to_supabase(suppliers):
    """مزامنة الموردين مع Supabase"""
    print("🔄 مزامنة الموردين مع Supabase...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    synced_count = 0
    error_count = 0
    
    for supplier in suppliers:
        try:
            # تحضير البيانات بما يتوافق مع schema الموجود
            contact_name = supplier.get('name', '').split()[0] if supplier.get('name') else 'غير محدد'
            
            data = {
                'name': supplier['name'] or 'مورد غير معروف',
                'contact_person': contact_name,
                'email': supplier.get('email') or None,
                'phone': supplier.get('phone') or supplier.get('mobile') or None,
                'address': f"{supplier.get('street', '')} {supplier.get('city', '')} {supplier['country_id'][1] if supplier.get('country_id') else ''}".strip() or None,
            }
            
            # إدراج فقط (بدون تحديث)
            result = supabase.table('suppliers').insert(data).execute()
            synced_count += 1
            
            if synced_count % 100 == 0:
                print(f"✅ تمت مزامنة {synced_count} مورد...")
                
        except Exception as e:
            error_count += 1
            print(f"❌ خطأ في مزامنة المورد {supplier['id']}: {str(e)}")
            continue
    
    print(f"\n🎉 اكتملت المزامنة!")
    print(f"✅ تمت مزامنة {synced_count} مورد بنجاح")
    if error_count > 0:
        print(f"❌ فشل {error_count} مورد")

def main():
    """الدالة الرئيسية"""
    print("=" * 60)
    print("🚀 بدء مزامنة الموردين من Odoo إلى Supabase")
    print("=" * 60)
    
    # التحقق من بيانات الاتصال
    if not all([ODOO_USERNAME, ODOO_PASSWORD, SUPABASE_KEY]):
        print("❌ خطأ: بيانات الاتصال غير مكتملة!")
        print("يرجى التأكد من تعيين جميع Environment Variables المطلوبة:")
        print("  - ODOO_USERNAME")
        print("  - ODOO_PASSWORD")
        print("  - SUPABASE_KEY")
        return
    
    try:
        # الاتصال بـ Odoo
        uid, models = connect_odoo()
        print(f"✅ تم الاتصال بـ Odoo بنجاح! (User ID: {uid})")
        
        # جلب الموردين
        suppliers = get_suppliers(uid, models)
        
        if suppliers:
            # المزامنة مع Supabase
            sync_to_supabase(suppliers)
        
        print("\n✅ اكتملت العملية بنجاح!")
        
    except Exception as e:
        print(f"\n❌ خطأ: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
