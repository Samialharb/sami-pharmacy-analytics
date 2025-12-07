#!/usr/bin/env node

/**
 * سكريبت لسحب البيانات من Odoo ERP إلى Supabase
 * يعمل بدون مكتبات خارجية (استخدام fetch المدمج)
 * 
 * الاستخدام:
 * node scripts/sync_odoo_daily.mjs
 */

import { createClient } from '@supabase/supabase-js';

// بيانات الاتصال
const ODOO_URL = 'https://health-path.erp-ksa.aumet.com';
const ODOO_DB = 'health-path.erp-ksa.aumet.com';
const ODOO_USERNAME = 'sami@aumet.com';
const ODOO_PASSWORD = 'Sami@1212';

const SUPABASE_URL = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzA0NzI3MCwiZXhwIjoxNzE5NjI5MjcwfQ.3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// دالة الاتصال بـ Odoo
async function callOdoo(method, model, args) {
  try {
    const response = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [ODOO_DB, 7, ODOO_PASSWORD, model, method, ...args]
        }
      })
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    return result.result;
  } catch (error) {
    throw new Error(`Odoo Error (${model}.${method}): ${error.message}`);
  }
}

// دالة مساعدة لإدراج البيانات
async function insertData(table, data) {
  if (!data || data.length === 0) return 0;
  
  try {
    const { error } = await supabase
      .from(table)
      .upsert(data, { onConflict: 'id' });
    
    if (error) throw error;
    return data.length;
  } catch (error) {
    console.error(`❌ خطأ في إدراج ${table}:`, error.message);
    return 0;
  }
}

// الدالة الرئيسية
async function syncData() {
  const startTime = Date.now();
  
  try {
    console.log('\n🚀 بدء مزامنة البيانات من Odoo إلى Supabase\n');
    console.log('═'.repeat(60));

    // 1. سحب طلبات المبيعات
    console.log('\n📥 سحب طلبات المبيعات...');
    const orders = await callOdoo('search_read', 'pos.order', [
      [],
      { 
        fields: ['id', 'name', 'date_order', 'amount_total', 'amount_paid', 'state', 'partner_id'],
        limit: 100000
      }
    ]);
    console.log(`✅ تم سحب ${orders.length} طلب`);
    const ordersInserted = await insertData('pos_order', orders);
    console.log(`💾 تم إدراج ${ordersInserted} طلب في Supabase`);

    // 2. سحب العملاء
    console.log('\n👥 سحب العملاء...');
    const customers = await callOdoo('search_read', 'res.partner', [
      [['customer_rank', '>', 0]],
      { 
        fields: ['id', 'name', 'email', 'phone', 'mobile', 'city', 'country_id'],
        limit: 100000
      }
    ]);
    console.log(`✅ تم سحب ${customers.length} عميل`);
    const customersInserted = await insertData('res_partner', customers);
    console.log(`💾 تم إدراج ${customersInserted} عميل في Supabase`);

    // 3. سحب المنتجات
    console.log('\n📦 سحب المنتجات...');
    const products = await callOdoo('search_read', 'product.product', [
      [['active', '=', true]],
      { 
        fields: ['id', 'name', 'default_code', 'list_price', 'standard_price', 'qty_available', 'categ_id'],
        limit: 100000
      }
    ]);
    console.log(`✅ تم سحب ${products.length} منتج`);
    const productsInserted = await insertData('product_product', products);
    console.log(`💾 تم إدراج ${productsInserted} منتج في Supabase`);

    // 4. سحب المخزون
    console.log('\n📊 سحب المخزون...');
    const inventory = await callOdoo('search_read', 'stock.quant', [
      [],
      { 
        fields: ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity'],
        limit: 100000
      }
    ]);
    console.log(`✅ تم سحب ${inventory.length} سجل مخزون`);
    const inventoryInserted = await insertData('stock_quant', inventory);
    console.log(`💾 تم إدراج ${inventoryInserted} سجل مخزون في Supabase`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const total = ordersInserted + customersInserted + productsInserted + inventoryInserted;

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ اكتملت المزامنة بنجاح!');
    console.log(`⏱️  المدة: ${duration} ثانية`);
    console.log('\n📊 ملخص البيانات:');
    console.log(`   • طلبات المبيعات: ${ordersInserted}`);
    console.log(`   • العملاء: ${customersInserted}`);
    console.log(`   • المنتجات: ${productsInserted}`);
    console.log(`   • سجلات المخزون: ${inventoryInserted}`);
    console.log(`   • الإجمالي: ${total}\n`);

  } catch (error) {
    console.error('\n❌ فشلت المزامنة:', error.message);
    console.error('\n📋 تفاصيل الخطأ:');
    console.error(error);
    process.exit(1);
  }
}

// تشغيل المزامنة
syncData();
