import { createClient } from '@supabase/supabase-js';

/**
 * سكريبت محسّن لسحب البيانات من Odoo ERP إلى Supabase
 * يستخدم batch processing لتجنب timeout
 */

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

// دالة إدراج البيانات بشكل آمن (batch)
async function insertDataBatch(table, data, batchSize = 500) {
  if (!data || data.length === 0) return 0;

  let inserted = 0;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    try {
      const { error } = await supabase.from(table).insert(batch);
      if (error) {
        console.log(`⚠️  تحذير في batch ${i / batchSize + 1}: ${error.message}`);
      } else {
        inserted += batch.length;
      }
    } catch (e) {
      console.log(`❌ خطأ في batch ${i / batchSize + 1}: ${e.message}`);
    }
  }
  return inserted;
}

// دالة تنظيف البيانات
function cleanData(data) {
  if (!data) return null;
  if (typeof data === 'object' && !Array.isArray(data)) {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === false || value === null || value === undefined) {
        cleaned[key] = null;
      } else if (typeof value === 'number' && value < 0) {
        cleaned[key] = null;
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }
  return data;
}

async function main() {
  console.log('🚀 بدء مزامنة البيانات من Odoo إلى Supabase (محسّن)');
  console.log('════════════════════════════════════════════════════════════');

  const startTime = Date.now();
  let totalInserted = 0;

  try {
    // 1. سحب طلبات المبيعات
    console.log('\n📥 سحب طلبات المبيعات...');
    try {
      const orderIds = await callOdoo('search', 'pos.order', [[]]);
      console.log(`✅ تم سحب ${orderIds.length} طلب من Odoo`);

      if (orderIds.length > 0) {
        // سحب البيانات على دفعات
        const batchSize = 100;
        let allOrders = [];

        for (let i = 0; i < orderIds.length; i += batchSize) {
          const batch = orderIds.slice(i, i + batchSize);
          const orders = await callOdoo('read', 'pos.order', [batch, ['id', 'name', 'date_order', 'amount_total', 'partner_id', 'session_id']]);
          allOrders = allOrders.concat(orders);
          console.log(`   • تم سحب batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orderIds.length / batchSize)}`);
        }

        // تنظيف البيانات
        const cleanedOrders = allOrders.map(order => ({
          aumet_id: order.id,
          name: order.name,
          date_order: order.date_order,
          amount_total: order.amount_total || 0,
          partner_id: order.partner_id?.[0] || null,
          session_id: order.session_id?.[0] || null
        })).map(cleanData);

        // إدراج البيانات
        const inserted = await insertDataBatch('aumet_sales_orders', cleanedOrders, 100);
        console.log(`💾 تم إدراج ${inserted} طلب في Supabase`);
        totalInserted += inserted;
      }
    } catch (error) {
      console.log(`⚠️  تحذير: فشل سحب المبيعات - ${error.message}`);
    }

    // 2. سحب العملاء
    console.log('\n👥 سحب العملاء...');
    try {
      const partnerIds = await callOdoo('search', 'res.partner', [[]]);
      console.log(`✅ تم سحب ${partnerIds.length} عميل من Odoo`);

      if (partnerIds.length > 0) {
        const batchSize = 200;
        let allPartners = [];

        for (let i = 0; i < partnerIds.length; i += batchSize) {
          const batch = partnerIds.slice(i, i + batchSize);
          const partners = await callOdoo('read', 'res.partner', [batch, ['id', 'name', 'email', 'phone', 'city']]);
          allPartners = allPartners.concat(partners);
          console.log(`   • تم سحب batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(partnerIds.length / batchSize)}`);
        }

        const cleanedPartners = allPartners.map(partner => ({
          aumet_id: partner.id,
          name: partner.name,
          email: partner.email || null,
          phone: partner.phone || null,
          city: partner.city || null
        })).map(cleanData);

        const inserted = await insertDataBatch('aumet_customers', cleanedPartners, 200);
        console.log(`💾 تم إدراج ${inserted} عميل في Supabase`);
        totalInserted += inserted;
      }
    } catch (error) {
      console.log(`⚠️  تحذير: فشل سحب العملاء - ${error.message}`);
    }

    // 3. سحب المخزون
    console.log('\n📦 سحب المخزون...');
    try {
      const stockIds = await callOdoo('search', 'stock.quant', [[]]);
      console.log(`✅ تم سحب ${stockIds.length} سجل مخزون من Odoo`);

      if (stockIds.length > 0) {
        const batchSize = 200;
        let allStock = [];

        for (let i = 0; i < stockIds.length; i += batchSize) {
          const batch = stockIds.slice(i, i + batchSize);
          const stock = await callOdoo('read', 'stock.quant', [batch, ['id', 'product_id', 'quantity', 'location_id']]);
          allStock = allStock.concat(stock);
          console.log(`   • تم سحب batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(stockIds.length / batchSize)}`);
        }

        const cleanedStock = allStock.map(item => ({
          aumet_id: item.id,
          product_id: item.product_id?.[0] || null,
          quantity: item.quantity || 0,
          location_id: item.location_id?.[0] || null
        })).map(cleanData);

        const inserted = await insertDataBatch('aumet_inventory', cleanedStock, 200);
        console.log(`💾 تم إدراج ${inserted} سجل مخزون في Supabase`);
        totalInserted += inserted;
      }
    } catch (error) {
      console.log(`⚠️  تحذير: فشل سحب المخزون - ${error.message}`);
    }

    // 4. سحب المنتجات
    console.log('\n🏷️  سحب المنتجات...');
    try {
      const productIds = await callOdoo('search', 'product.product', [[]]);
      console.log(`✅ تم سحب ${productIds.length} منتج من Odoo`);

      if (productIds.length > 0) {
        const batchSize = 200;
        let allProducts = [];

        for (let i = 0; i < productIds.length; i += batchSize) {
          const batch = productIds.slice(i, i + batchSize);
          const products = await callOdoo('read', 'product.product', [batch, ['id', 'name', 'list_price', 'categ_id']]);
          allProducts = allProducts.concat(products);
          console.log(`   • تم سحب batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(productIds.length / batchSize)}`);
        }

        const cleanedProducts = allProducts.map(product => ({
          aumet_id: product.id,
          name: product.name,
          list_price: product.list_price || 0,
          categ_id: product.categ_id?.[0] || null
        })).map(cleanData);

        const inserted = await insertDataBatch('aumet_products', cleanedProducts, 200);
        console.log(`💾 تم إدراج ${inserted} منتج في Supabase`);
        totalInserted += inserted;
      }
    } catch (error) {
      console.log(`⚠️  تحذير: فشل سحب المنتجات - ${error.message}`);
    }

    console.log('\n════════════════════════════════════════════════════════════');
    console.log('✅ اكتملت المزامنة بنجاح!');
    console.log(`⏱️  المدة: ${((Date.now() - startTime) / 1000).toFixed(2)} ثانية`);
    console.log(`📊 إجمالي البيانات المُدرجة: ${totalInserted}`);
  } catch (error) {
    console.error('❌ خطأ حرج:', error.message);
    process.exit(1);
  }
}

main();
