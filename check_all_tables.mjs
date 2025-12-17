import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzg0NzgsImV4cCI6MTc2MTYxNDQ3OH0.oHdDfLpHMdNvPBmKrV_Yw_0vvDTMqLgZHkNZAkxLpKQ'
);

const tables = [
  'aumet_sales_orders',
  'aumet_customers',
  'aumet_inventory',
  'aumet_products',
  'purchase_orders',
  'suppliers',
  'invoices',
  'analytics_summary',
  'aumet_financial_moves'
];

console.log('🔍 فحص شامل لجميع الجداول في Supabase\n');
console.log('═'.repeat(80));

for (const table of tables) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: خطأ - ${error.message}`);
    } else {
      console.log(`✅ ${table}: ${count || 0} سجل`);
    }
  } catch (e) {
    console.log(`⚠️  ${table}: خطأ في الاتصال`);
  }
}

console.log('\n═'.repeat(80));

// فحص آخر طلب مبيعات
console.log('\n📊 آخر طلب مبيعات:');
const { data: lastOrder } = await supabase
  .from('aumet_sales_orders')
  .select('date_order, amount_total')
  .order('date_order', { ascending: false })
  .limit(1);

if (lastOrder && lastOrder[0]) {
  console.log(`التاريخ: ${lastOrder[0].date_order}`);
  console.log(`المبلغ: ${lastOrder[0].amount_total}`);
} else {
  console.log('لا توجد بيانات');
}
