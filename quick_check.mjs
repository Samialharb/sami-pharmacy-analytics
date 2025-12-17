import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzg0NzgsImV4cCI6MTc2MTYxNDQ3OH0.oHdDfLpHMdNvPBmKrV_Yw_0vvDTMqLgZHkNZAkxLpKQ'
);

// فحص التواريخ
const { data } = await supabase
  .from('aumet_sales_orders')
  .select('date_order, amount_total')
  .order('date_order', { ascending: false })
  .limit(5);

console.log('آخر 5 طلبات:');
data?.forEach(d => console.log(d.date_order, d.amount_total));
