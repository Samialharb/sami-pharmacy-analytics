import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA'
);

console.log('🔍 فحص تواريخ المبيعات:\n');

// آخر طلب
const { data: last } = await supabase
  .from('aumet_sales_orders')
  .select('date_order, amount_total')
  .order('date_order', { ascending: false })
  .limit(1);

console.log(`📅 آخر طلب: ${last?.[0]?.date_order || 'لا توجد بيانات'}`);
console.log(`💰 المبلغ: ${last?.[0]?.amount_total || 0}\n`);

// أول طلب بعد 23 نوفمبر
const { data: after23 } = await supabase
  .from('aumet_sales_orders')
  .select('date_order, amount_total')
  .gte('date_order', '2025-11-24')
  .order('date_order', { ascending: true })
  .limit(5);

console.log('📊 أول 5 طلبات بعد 23 نوفمبر:');
after23?.forEach((order, i) => {
  console.log(`  ${i+1}. ${order.date_order} - ${order.amount_total} ريال`);
});

// إحصائيات
const { count } = await supabase
  .from('aumet_sales_orders')
  .select('*', { count: 'exact', head: true })
  .gte('date_order', '2025-11-24');

console.log(`\n✅ عدد الطلبات بعد 23 نوفمبر: ${count}`);
