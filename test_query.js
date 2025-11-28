import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.Ux7QLuPABFH9Ky8wNxmGbMsqNGTKpEQD2TKJWPIAr9A'
);

const { data, error, count } = await supabase
  .from('aumet_sales_orders')
  .select('amount_total, state', { count: 'exact' })
  .limit(10);

console.log('Data:', data);
console.log('Error:', error);
console.log('Count:', count);
