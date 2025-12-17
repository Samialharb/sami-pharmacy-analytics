import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzg0NzgsImV4cCI6MTc2MTYxNDQ3OH0.oHdDfLpHMdNvPBmKrV_Yw_0vvDTMqLgZHkNZAkxLpKQ'
);

console.log('🔍 فحص شامل لبيانات Supabase\n');
console.log('═'.repeat(80));

// 1. فحص جدول المبيعات
console.log('\n📊 جدول aumet_sales_orders:');
const { count: ordersCount } = await supabase
  .from('aumet_sales_orders')
  .select('*', { count: 'exact' })
  .limit(1);

console.log(`   • إجمالي الطلبات: ${ordersCount}`);

// آخر 5 طلبات
const { data: lastOrders } = await supabase
  .from('aumet_sales_orders')
  .select('aumet_id, date_order, amount_total')
  .order('date_order', { ascending: false })
  .limit(5);

console.log('   • آخر 5 طلبات:');
lastOrders?.forEach(o => {
  console.log(`     - ID: ${o.aumet_id} | التاريخ: ${o.date_order} | المبلغ: ${o.amount_total}`);
});

// عدد الطلبات حسب التاريخ
const { data: dateStats } = await supabase
  .from('aumet_sales_orders')
  .select('date_order')
  .order('date_order', { ascending: false });

const dateGroups = {};
dateStats?.forEach(o => {
  const date = o.date_order?.split('T')[0] || 'Unknown';
  dateGroups[date] = (dateGroups[date] || 0) + 1;
});

console.log('   • توزيع الطلبات حسب التاريخ (آخر 15 يوم):');
Object.entries(dateGroups).slice(0, 15).forEach(([date, count]) => {
  console.log(`     - ${date}: ${count} طلب`);
});

// 2. فحص جدول العملاء
console.log('\n👥 جدول aumet_customers:');
const { count: customersCount } = await supabase
  .from('aumet_customers')
  .select('*', { count: 'exact' })
  .limit(1);

console.log(`   • إجمالي العملاء: ${customersCount}`);

// 3. فحص جدول المخزون
console.log('\n📦 جدول aumet_inventory:');
const { count: inventoryCount } = await supabase
  .from('aumet_inventory')
  .select('*', { count: 'exact' })
  .limit(1);

console.log(`   • إجمالي سجلات المخزون: ${inventoryCount}`);

// 4. فحص جدول المنتجات
console.log('\n🏷️  جدول aumet_products:');
const { count: productsCount } = await supabase
  .from('aumet_products')
  .select('*', { count: 'exact' })
  .limit(1);

console.log(`   • إجمالي المنتجات: ${productsCount}`);

console.log('\n═'.repeat(80));
console.log('✅ انتهى الفحص الشامل');
