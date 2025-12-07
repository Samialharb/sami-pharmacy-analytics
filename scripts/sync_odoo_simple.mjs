#!/usr/bin/env node

/**
 * سكريبت بسيط لسحب البيانات من Odoo ERP إلى Supabase
 * 
 * الاستخدام:
 * node scripts/sync_odoo_simple.mjs
 */

import fetch from 'node-fetch';
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
}

// سحب البيانات
async function syncData() {
  try {
    console.log('🔄 جاري مزامنة البيانات...\n');

    // 1. سحب طلبات المبيعات
    console.log('📥 سحب طلبات المبيعات...');
    const orders = await callOdoo('search_read', 'pos.order', [
      [],
      { fields: ['id', 'name', 'date_order', 'amount_total', 'state', 'partner_id'], limit: 100000 }
    ]);
    console.log(`✅ تم سحب ${orders.length} طلب\n`);

    // 2. سحب العملاء
    console.log('👥 سحب العملاء...');
    const customers = await callOdoo('search_read', 'res.partner', [
      [['customer_rank', '>', 0]],
      { fields: ['id', 'name', 'email', 'phone', 'mobile', 'city'], limit: 100000 }
    ]);
    console.log(`✅ تم سحب ${customers.length} عميل\n`);

    // 3. سحب المنتجات
    console.log('📦 سحب المنتجات...');
    const products = await callOdoo('search_read', 'product.product', [
      [['active', '=', true]],
      { fields: ['id', 'name', 'default_code', 'list_price', 'qty_available'], limit: 100000 }
    ]);
    console.log(`✅ تم سحب ${products.length} منتج\n`);

    // 4. سحب المخزون
    console.log('📊 سحب المخزون...');
    const inventory = await callOdoo('search_read', 'stock.quant', [
      [],
      { fields: ['id', 'product_id', 'location_id', 'quantity'], limit: 100000 }
    ]);
    console.log(`✅ تم سحب ${inventory.length} سجل مخزون\n`);

    // إدراج البيانات في Supabase
    console.log('💾 إدراج البيانات في Supabase...\n');

    if (orders.length > 0) {
      await supabase.from('pos_order').upsert(orders, { onConflict: 'id' });
      console.log(`✅ تم إدراج ${orders.length} طلب مبيعات`);
    }

    if (customers.length > 0) {
      await supabase.from('res_partner').upsert(customers, { onConflict: 'id' });
      console.log(`✅ تم إدراج ${customers.length} عميل`);
    }

    if (products.length > 0) {
      await supabase.from('product_product').upsert(products, { onConflict: 'id' });
      console.log(`✅ تم إدراج ${products.length} منتج`);
    }

    if (inventory.length > 0) {
      await supabase.from('stock_quant').upsert(inventory, { onConflict: 'id' });
      console.log(`✅ تم إدراج ${inventory.length} سجل مخزون`);
    }

    console.log('\n✅ اكتملت المزامنة بنجاح!');
    console.log(`📊 الإجمالي: ${orders.length + customers.length + products.length + inventory.length} سجل`);

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

// تشغيل المزامنة
syncData();
