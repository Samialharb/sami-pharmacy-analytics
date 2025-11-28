import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Supabase connection...');

// Test query
const { data, error, count } = await supabase
  .from('aumet_sales_orders')
  .select('amount_total, state', { count: 'exact' })
  .limit(10);

if (error) {
  console.error('❌ Error:', error);
} else {
  console.log('✅ Success!');
  console.log('Count:', count);
  console.log('Data:', data);
}
