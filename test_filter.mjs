import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// اختبار فلتر شهري (مايو 2025)
const month = 5;
const year = 2025;

const startDate = new Date(year, month - 1, 1);
const endDate = new Date(year, month, 0, 23, 59, 59);

console.log('Start Date:', startDate.toISOString());
console.log('End Date:', endDate.toISOString());

const { data, error } = await supabase
  .from('aumet_sales_orders')
  .select('id, name, amount_total, date_order')
  .gte('date_order', startDate.toISOString())
  .lte('date_order', endDate.toISOString())
  .limit(10);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Found', data.length, 'orders');
  console.log('Sample:', data[0]);
}
