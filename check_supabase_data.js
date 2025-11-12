import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Fetching sample sales data...\n');
  
  const { data, error } = await supabase
    .from('aumet_sales_orders')
    .select('id, name, date_order, amount_total, state')
    .order('date_order', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Latest 10 orders:');
  console.table(data);
  
  // Check date range
  console.log('\n📊 Date range analysis:');
  const dates = data.map(d => new Date(d.date_order));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  console.log(`Oldest: ${minDate.toLocaleDateString('ar-SA')}`);
  console.log(`Newest: ${maxDate.toLocaleDateString('ar-SA')}`);
  
  // Count by month
  const { data: allData } = await supabase
    .from('aumet_sales_orders')
    .select('date_order, amount_total');
    
  const monthCounts = {};
  allData.forEach(order => {
    const date = new Date(order.date_order);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthCounts[monthKey]) {
      monthCounts[monthKey] = { count: 0, total: 0 };
    }
    monthCounts[monthKey].count++;
    monthCounts[monthKey].total += order.amount_total || 0;
  });
  
  console.log('\n📅 Orders by month:');
  Object.entries(monthCounts)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 6)
    .forEach(([month, stats]) => {
      console.log(`${month}: ${stats.count} orders, ${stats.total.toFixed(2)} SAR`);
    });
}

checkData();
