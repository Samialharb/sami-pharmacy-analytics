#!/usr/bin/env node

/**
 * سكريبت لسحب البيانات من Odoo ERP إلى Supabase
 * يستخدم الجداول الصحيحة: aumet_sales_orders, aumet_customers, aumet_products, aumet_inventory
 * 
 * الاستخدام:
 * node scripts/sync_odoo_correct.mjs
 */

import { createClient } from '@supabase/supabase-js';

// بيانات الاتصال
const ODOO_URL = 'https://health-path.erp-ksa.aumet.com';
const ODOO_DB = 'health-path.erp-ksa.aumet.com';
const ODOO_USERNAME = 'sami@aumet.com';
const ODOO_PASSWORD = 'Sami@1212';

const SUPABASE_URL = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

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
      .upsert(data, { onConflict: 'aumet_id' });
    
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
    let ordersInserted = 0;
    try {
      const orders = await callOdoo('search_read', 'pos.order', [
        [],
        { 
          fields: ['id', 'name', 'date_order', 'amount_total', 'amount_paid', 'state', 'partner_id', 'amount_tax'],
          limit: 100000
        }
      ]);
      console.log(`✅ تم سحب ${orders.length} طلب من Odoo`);
      
      // تنظيف البيانات
      const cleanedOrders = orders.map(order => ({
        aumet_id: order.id,
        name: order.name || '',
        date_order: order.date_order || new Date().toISOString(),
        amount_total: typeof order.amount_total === 'number' ? order.amount_total : (parseFloat(order.amount_total) || 0),
        amount_paid: typeof order.amount_paid === 'number' ? order.amount_paid : (parseFloat(order.amount_paid) || 0),
        amount_tax: typeof order.amount_tax === 'number' ? order.amount_tax : (parseFloat(order.amount_tax) || 0),
        state: order.state || 'draft',
        partner_id: typeof order.partner_id === 'object' ? order.partner_id[0] : (order.partner_id || null),
        customer_aumet_id: typeof order.partner_id === 'object' ? order.partner_id[0] : (order.partner_id || null)
      })).filter(o => o.aumet_id && o.aumet_id !== false && o.amount_total >= 0 && o.amount_paid >= 0 && o.amount_tax >= 0);
      
      ordersInserted = await insertData('aumet_sales_orders', cleanedOrders);
      console.log(`💾 تم إدراج ${ordersInserted} طلب في Supabase`);
    } catch (error) {
      console.warn(`⚠️  تحذير: فشل سحب المبيعات - ${error.message}`);
    }

    // 2. سحب العملاء
    console.log('\n👥 سحب العملاء...');
    let customersInserted = 0;
    try {
      const customers = await callOdoo('search_read', 'res.partner', [
        [['customer_rank', '>', 0]],
        { 
          fields: ['id', 'name', 'email', 'phone', 'mobile', 'is_company', 'customer_rank', 'supplier_rank'],
          limit: 100000
        }
      ]);
      console.log(`✅ تم سحب ${customers.length} عميل من Odoo`);
      
      const cleanedCustomers = customers.map(customer => ({
        aumet_id: customer.id,
        name: customer.name,
        email: customer.email || null,
        phone: customer.phone || customer.mobile || null,
        is_company: customer.is_company || false,
        customer_rank: customer.customer_rank || 0,
        supplier_rank: customer.supplier_rank || 0
      }));
      
      customersInserted = await insertData('aumet_customers', cleanedCustomers);
      console.log(`💾 تم إدراج ${customersInserted} عميل في Supabase`);
    } catch (error) {
      console.warn(`⚠️  تحذير: فشل سحب العملاء - ${error.message}`);
      console.log('🔄 محاولة سحب جميع الشركاء بدون فلتر...');
      try {
        const allPartners = await callOdoo('search_read', 'res.partner', [
          [],
          { 
            fields: ['id', 'name', 'email', 'phone', 'mobile', 'is_company', 'customer_rank', 'supplier_rank'],
            limit: 100000
          }
        ]);
        console.log(`✅ تم سحب ${allPartners.length} شريك من Odoo`);
        
        const cleanedPartners = allPartners.map(partner => ({
          aumet_id: partner.id,
          name: partner.name || 'Unknown',
          email: partner.email || null,
          phone: (partner.phone || partner.mobile) || null,
          is_company: partner.is_company === true ? true : false,
          customer_rank: Math.max(0, typeof partner.customer_rank === 'number' ? partner.customer_rank : 0),
          supplier_rank: Math.max(0, typeof partner.supplier_rank === 'number' ? partner.supplier_rank : 0)
        })).filter(p => p.aumet_id && p.aumet_id !== false);
        
        customersInserted = await insertData('aumet_customers', cleanedPartners);
        console.log(`💾 تم إدراج ${customersInserted} شريك في Supabase`);
      } catch (innerError) {
        console.warn(`⚠️  فشل سحب الشركاء أيضاً - ${innerError.message}`);
      }
    }

    // 3. سحب المنتجات
    console.log('\n📦 سحب المنتجات...');
    let productsInserted = 0;
    try {
      const products = await callOdoo('search_read', 'product.product', [
        [['active', '=', true]],
        { 
          fields: ['id', 'name', 'default_code', 'list_price', 'standard_price', 'categ_id'],
          limit: 100000
        }
      ]);
      console.log(`✅ تم سحب ${products.length} منتج من Odoo`);
      
      const cleanedProducts = products.map(product => ({
        aumet_id: product.id,
        name: product.name || 'Unknown',
        default_code: product.default_code || null,
        list_price: Math.max(0, parseFloat(product.list_price) || 0),
        standard_price: Math.max(0, parseFloat(product.standard_price) || 0),
        categ_id: typeof product.categ_id === 'object' ? product.categ_id[0] : product.categ_id,
        active: true
      })).filter(p => p.aumet_id && p.aumet_id !== false);
      
      productsInserted = await insertData('aumet_products', cleanedProducts);
      console.log(`💾 تم إدراج ${productsInserted} منتج في Supabase`);
    } catch (error) {
      console.warn(`⚠️  تحذير: فشل سحب المنتجات - ${error.message}`);
    }

    // 4. سحب المخزون
    console.log('\n📊 سحب المخزون...');
    let inventoryInserted = 0;
    try {
      const inventory = await callOdoo('search_read', 'stock.quant', [
        [],
        { 
          fields: ['id', 'product_id', 'location_id', 'quantity', 'reserved_quantity'],
          limit: 100000
        }
      ]);
      console.log(`✅ تم سحب ${inventory.length} سجل مخزون من Odoo`);
      
      const cleanedInventory = inventory.map(item => {
        const qty = parseFloat(item.quantity) || 0;
        const reserved = parseFloat(item.reserved_quantity) || 0;
        return {
          aumet_id: item.id,
          product_id: typeof item.product_id === 'object' ? item.product_id[0] : item.product_id,
          location_id: typeof item.location_id === 'object' ? item.location_id[0] : item.location_id,
          quantity: qty,
          available_quantity: qty - reserved,
          product_aumet_id: typeof item.product_id === 'object' ? item.product_id[0] : item.product_id
        };
      });
      
      inventoryInserted = await insertData('aumet_inventory', cleanedInventory);
      console.log(`💾 تم إدراج ${inventoryInserted} سجل مخزون في Supabase`);
    } catch (error) {
      console.warn(`⚠️  تحذير: فشل سحب المخزون - ${error.message}`);
    }

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
