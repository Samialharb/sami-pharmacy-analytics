#!/usr/bin/env node

/**
 * سكريبت متقدم لمزامنة البيانات من Odoo ERP إلى Supabase
 * يسحب: طلبات المبيعات، العملاء، المنتجات، المخزون
 * 
 * الاستخدام:
 * node sync_odoo.mjs
 * 
 * المتغيرات البيئية المطلوبة:
 * - ODOO_URL: رابط Odoo (مثل: https://health-path.erp-ksa.aumet.com)
 * - ODOO_DB: اسم قاعدة البيانات
 * - ODOO_USERNAME: اسم المستخدم
 * - ODOO_PASSWORD: كلمة المرور
 * - SUPABASE_URL: رابط Supabase
 * - SUPABASE_SERVICE_ROLE_KEY: مفتاح الخادم
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// إعدادات الاتصال
// ============================================================================

const ODOO_URL = process.env.ODOO_URL || 'https://health-path.erp-ksa.aumet.com';
const ODOO_DB = process.env.ODOO_DB || 'health-path.erp-ksa.aumet.com';
const ODOO_USERNAME = process.env.ODOO_USERNAME || 'admin';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// التحقق من المتغيرات البيئية
// ============================================================================

function validateEnv() {
  const missing = [];
  
  if (!ODOO_PASSWORD) missing.push('ODOO_PASSWORD');
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  
  if (missing.length > 0) {
    console.error('❌ متغيرات بيئية مفقودة:', missing.join(', '));
    process.exit(1);
  }
}

// ============================================================================
// عميل Supabase
// ============================================================================

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================================
// دوال الاتصال بـ Odoo
// ============================================================================

/**
 * الاتصال بـ Odoo والحصول على user_id
 */
async function authenticateOdoo() {
  console.log('🔐 جاري الاتصال بـ Odoo...');
  console.log(`   URL: ${ODOO_URL}`);
  console.log(`   Database: ${ODOO_DB}`);
  
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'common',
      method: 'authenticate',
      args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD]
    },
    id: 1
  };

  try {
    const response = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Odoo Error: ${JSON.stringify(result.error)}`);
    }

    const userId = result.result;
    console.log(`✅ تم الاتصال بنجاح! User ID: ${userId}\n`);
    return userId;
  } catch (error) {
    console.error('❌ فشل الاتصال بـ Odoo:', error.message);
    throw error;
  }
}

/**
 * استدعاء Odoo RPC
 */
async function callOdooRpc(userId, model, method, args = [], options = {}) {
  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [ODOO_DB, userId, ODOO_PASSWORD, model, method, ...args]
    },
    id: Math.random()
  };

  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    timeout: 30000
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const result = await response.json();

  if (result.error) {
    throw new Error(`Odoo Error: ${JSON.stringify(result.error)}`);
  }

  return result.result;
}

// ============================================================================
// دوال سحب البيانات
// ============================================================================

/**
 * سحب طلبات المبيعات
 */
async function fetchSalesOrders(userId) {
  console.log('📥 جاري سحب طلبات المبيعات من Odoo...');
  
  try {
    const orders = await callOdooRpc(
      userId,
      'pos.order',
      'search_read',
      [
        [['date_order', '>=', '2024-11-24']],
        {
          fields: [
            'id', 'name', 'date_order', 'amount_total', 
            'amount_paid', 'amount_return', 'state', 'partner_id'
          ],
          limit: 100000
        }
      ]
    );

    console.log(`✅ تم سحب ${orders.length} طلب مبيعات\n`);
    return orders;
  } catch (error) {
    console.error('❌ فشل سحب طلبات المبيعات:', error.message);
    throw error;
  }
}

/**
 * سحب العملاء
 */
async function fetchCustomers(userId) {
  console.log('👥 جاري سحب العملاء من Odoo...');
  
  try {
    const customers = await callOdooRpc(
      userId,
      'res.partner',
      'search_read',
      [
        [['customer_rank', '>', 0]],
        {
          fields: [
            'id', 'name', 'email', 'phone', 'mobile',
            'city', 'country_id', 'credit_limit', 'sale_order_count'
          ],
          limit: 100000
        }
      ]
    );

    console.log(`✅ تم سحب ${customers.length} عميل\n`);
    return customers;
  } catch (error) {
    console.error('❌ فشل سحب العملاء:', error.message);
    throw error;
  }
}

/**
 * سحب المنتجات
 */
async function fetchProducts(userId) {
  console.log('📦 جاري سحب المنتجات من Odoo...');
  
  try {
    const products = await callOdooRpc(
      userId,
      'product.product',
      'search_read',
      [
        [['active', '=', true]],
        {
          fields: [
            'id', 'name', 'default_code', 'list_price',
            'standard_price', 'categ_id', 'qty_available',
            'virtual_available', 'uom_id'
          ],
          limit: 100000
        }
      ]
    );

    console.log(`✅ تم سحب ${products.length} منتج\n`);
    return products;
  } catch (error) {
    console.error('❌ فشل سحب المنتجات:', error.message);
    throw error;
  }
}

/**
 * سحب المخزون
 */
async function fetchInventory(userId) {
  console.log('📊 جاري سحب بيانات المخزون من Odoo...');
  
  try {
    const inventory = await callOdooRpc(
      userId,
      'stock.quant',
      'search_read',
      [
        [],
        {
          fields: [
            'id', 'product_id', 'location_id', 'quantity',
            'reserved_quantity', 'available_quantity'
          ],
          limit: 100000
        }
      ]
    );

    console.log(`✅ تم سحب ${inventory.length} سجل مخزون\n`);
    return inventory;
  } catch (error) {
    console.error('❌ فشل سحب المخزون:', error.message);
    throw error;
  }
}

// ============================================================================
// دوال الإدراج في Supabase
// ============================================================================

/**
 * إدراج طلبات المبيعات
 */
async function insertSalesOrders(orders) {
  console.log('💾 جاري إدراج طلبات المبيعات في Supabase...');
  
  if (orders.length === 0) {
    console.log('⚠️ لا توجد طلبات جديدة\n');
    return;
  }

  try {
    const { error } = await supabase
      .from('pos_order')
      .upsert(orders, { onConflict: 'id' });

    if (error) throw error;
    console.log(`✅ تم إدراج ${orders.length} طلب مبيعات\n`);
  } catch (error) {
    console.error('❌ فشل إدراج طلبات المبيعات:', error.message);
    throw error;
  }
}

/**
 * إدراج العملاء
 */
async function insertCustomers(customers) {
  console.log('💾 جاري إدراج العملاء في Supabase...');
  
  if (customers.length === 0) {
    console.log('⚠️ لا توجد عملاء جدد\n');
    return;
  }

  try {
    const { error } = await supabase
      .from('res_partner')
      .upsert(customers, { onConflict: 'id' });

    if (error) throw error;
    console.log(`✅ تم إدراج ${customers.length} عميل\n`);
  } catch (error) {
    console.error('❌ فشل إدراج العملاء:', error.message);
    throw error;
  }
}

/**
 * إدراج المنتجات
 */
async function insertProducts(products) {
  console.log('💾 جاري إدراج المنتجات في Supabase...');
  
  if (products.length === 0) {
    console.log('⚠️ لا توجد منتجات جديدة\n');
    return;
  }

  try {
    const { error } = await supabase
      .from('product_product')
      .upsert(products, { onConflict: 'id' });

    if (error) throw error;
    console.log(`✅ تم إدراج ${products.length} منتج\n`);
  } catch (error) {
    console.error('❌ فشل إدراج المنتجات:', error.message);
    throw error;
  }
}

/**
 * إدراج المخزون
 */
async function insertInventory(inventory) {
  console.log('💾 جاري إدراج بيانات المخزون في Supabase...');
  
  if (inventory.length === 0) {
    console.log('⚠️ لا توجد بيانات مخزون جديدة\n');
    return;
  }

  try {
    const { error } = await supabase
      .from('stock_quant')
      .upsert(inventory, { onConflict: 'id' });

    if (error) throw error;
    console.log(`✅ تم إدراج ${inventory.length} سجل مخزون\n`);
  } catch (error) {
    console.error('❌ فشل إدراج المخزون:', error.message);
    throw error;
  }
}

// ============================================================================
// الدالة الرئيسية
// ============================================================================

async function main() {
  const startTime = Date.now();
  
  try {
    console.log('\n🚀 بدء مزامنة البيانات من Odoo ERP إلى Supabase\n');
    console.log('═'.repeat(60));
    
    // التحقق من المتغيرات البيئية
    validateEnv();
    
    // الاتصال بـ Odoo
    const userId = await authenticateOdoo();
    
    // سحب البيانات
    const [orders, customers, products, inventory] = await Promise.all([
      fetchSalesOrders(userId),
      fetchCustomers(userId),
      fetchProducts(userId),
      fetchInventory(userId)
    ]);
    
    // إدراج البيانات في Supabase
    await Promise.all([
      insertSalesOrders(orders),
      insertCustomers(customers),
      insertProducts(products),
      insertInventory(inventory)
    ]);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('═'.repeat(60));
    console.log('\n✅ اكتملت المزامنة بنجاح!');
    console.log(`⏱️  المدة: ${duration} ثانية\n`);
    
    console.log('📊 ملخص البيانات المنقولة:');
    console.log(`   • طلبات المبيعات: ${orders.length}`);
    console.log(`   • العملاء: ${customers.length}`);
    console.log(`   • المنتجات: ${products.length}`);
    console.log(`   • سجلات المخزون: ${inventory.length}`);
    console.log(`   • الإجمالي: ${orders.length + customers.length + products.length + inventory.length}\n`);
    
  } catch (error) {
    console.error('\n❌ فشلت المزامنة:', error.message);
    console.error('\n📋 تفاصيل الخطأ:');
    console.error(error);
    process.exit(1);
  }
}

// تشغيل الدالة الرئيسية
main();
