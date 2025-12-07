#!/usr/bin/env node

/**
 * سكريبت لسحب البيانات من Odoo إلى Supabase
 * يسحب طلبات المبيعات من 24 نوفمبر إلى 6 ديسمبر 2024
 */

import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

// بيانات الاتصال
const ODOO_URL = process.env.ODOO_URL || 'https://aumet.odoo.com';
const ODOO_DB = process.env.ODOO_DB || 'aumet';
const ODOO_USERNAME = process.env.ODOO_USERNAME || 'admin';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// إنشاء عميل Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * الاتصال بـ Odoo والحصول على user_id
 */
async function authenticateOdoo() {
  console.log('🔐 جاري الاتصال بـ Odoo...');
  
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
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`Odoo Error: ${result.error.message}`);
    }

    const userId = result.result;
    console.log(`✅ تم الاتصال بنجاح! User ID: ${userId}`);
    return userId;
  } catch (error) {
    console.error('❌ فشل الاتصال بـ Odoo:', error.message);
    throw error;
  }
}

/**
 * سحب طلبات المبيعات من Odoo
 */
async function fetchSalesOrders(userId) {
  console.log('📥 جاري سحب طلبات المبيعات من Odoo...');

  const startDate = '2024-11-24';
  const endDate = '2024-12-06';

  const payload = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'object',
      method: 'execute_kw',
      args: [
        ODOO_DB,
        userId,
        ODOO_PASSWORD,
        'pos.order',
        'search_read',
        [['date_order', '>=', startDate], ['date_order', '<=', endDate]],
        {
          fields: ['id', 'name', 'date_order', 'amount_total', 'state', 'partner_id'],
          limit: 10000
        }
      ]
    },
    id: 2
  };

  try {
    const response = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(`Odoo Error: ${result.error.message}`);
    }

    const orders = result.result;
    console.log(`✅ تم سحب ${orders.length} طلب من Odoo`);
    return orders;
  } catch (error) {
    console.error('❌ فشل سحب البيانات:', error.message);
    throw error;
  }
}

/**
 * إدراج البيانات في Supabase
 */
async function insertToSupabase(orders) {
  console.log('💾 جاري إدراج البيانات في Supabase...');

  if (orders.length === 0) {
    console.log('⚠️ لا توجد طلبات جديدة');
    return;
  }

  // تحويل البيانات إلى الصيغة المطلوبة
  const formattedOrders = orders.map(order => ({
    name: order.name,
    date_order: order.date_order,
    amount_total: order.amount_total,
    state: order.state,
    partner_id: order.partner_id ? order.partner_id[0] : null,
    // إضافة حقول أخرى حسب الحاجة
  }));

  try {
    // حذف البيانات القديمة (اختياري)
    // await supabase.from('pos_order').delete().gte('date_order', '2024-11-24');

    // إدراج البيانات الجديدة
    const { data, error } = await supabase
      .from('pos_order')
      .upsert(formattedOrders, { onConflict: 'name' });

    if (error) {
      throw error;
    }

    console.log(`✅ تم إدراج ${formattedOrders.length} طلب في Supabase`);
  } catch (error) {
    console.error('❌ فشل الإدراج في Supabase:', error.message);
    throw error;
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  try {
    console.log('🚀 بدء مزامنة البيانات من Odoo إلى Supabase\n');

    // 1. الاتصال بـ Odoo
    const userId = await authenticateOdoo();

    // 2. سحب البيانات
    const orders = await fetchSalesOrders(userId);

    // 3. إدراج في Supabase
    await insertToSupabase(orders);

    console.log('\n✅ اكتملت المزامنة بنجاح!');
  } catch (error) {
    console.error('\n❌ فشلت المزامنة:', error.message);
    process.exit(1);
  }
}

// تشغيل الدالة الرئيسية
main();
