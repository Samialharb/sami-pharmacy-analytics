import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzg0NzgsImV4cCI6MTc2MTYxNDQ3OH0.oHdDfLpHMdNvPBmKrV_Yw_0vvDTMqLgZHkNZAkxLpKQ'
);

console.log('فحص الجداول:');

// 1. المبيعات
const { count: c1 } = await supabase.from('aumet_sales_orders').select('*', { count: 'exact', head: true });
console.log(`1. aumet_sales_orders: ${c1}`);

// 2. العملاء
const { count: c2 } = await supabase.from('aumet_customers').select('*', { count: 'exact', head: true });
console.log(`2. aumet_customers: ${c2}`);

// 3. المخزون
const { count: c3 } = await supabase.from('aumet_inventory').select('*', { count: 'exact', head: true });
console.log(`3. aumet_inventory: ${c3}`);

// 4. المنتجات
const { count: c4 } = await supabase.from('aumet_products').select('*', { count: 'exact', head: true });
console.log(`4. aumet_products: ${c4}`);

// 5. أوامر الشراء
const { count: c5 } = await supabase.from('purchase_orders').select('*', { count: 'exact', head: true });
console.log(`5. purchase_orders: ${c5}`);

// 6. الموردين
const { count: c6 } = await supabase.from('suppliers').select('*', { count: 'exact', head: true });
console.log(`6. suppliers: ${c6}`);

// آخر طلب مبيعات
const { data: last } = await supabase.from('aumet_sales_orders').select('date_order').order('date_order', { ascending: false }).limit(1);
console.log(`\nآخر طلب: ${last?.[0]?.date_order || 'لا توجد بيانات'}`);
