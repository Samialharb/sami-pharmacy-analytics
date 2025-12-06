import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcpxhbqjqxvwgqpxbvdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcHhoYnFqcXh2d2dxcHhidmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NjM4NzAsImV4cCI6MjA0ODUzOTg3MH0.tT3Ml5H_kH3o8vYEOUnOQNqhAnii3gZqsj-vxqJEKMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestSales() {
  console.log('🔍 فحص آخر بيانات المبيعات في Supabase...\n');

  // 1. فحص آخر 10 طلبات
  const { data: latestOrders, error: ordersError } = await supabase
    .from('pos_order')
    .select('id, name, date_order, amount_total, state')
    .order('date_order', { ascending: false })
    .limit(10);

  if (ordersError) {
    console.error('❌ خطأ في جلب الطلبات:', ordersError);
    return;
  }

  console.log('📊 آخر 10 طلبات في Supabase:');
  console.log('=====================================');
  latestOrders.forEach((order, index) => {
    const date = new Date(order.date_order);
    console.log(`${index + 1}. ${order.name}`);
    console.log(`   التاريخ: ${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA')}`);
    console.log(`   المبلغ: ${order.amount_total} ريال`);
    console.log(`   الحالة: ${order.state}`);
    console.log('');
  });

  // 2. فحص آخر تاريخ في قاعدة البيانات
  const { data: maxDate, error: maxError } = await supabase
    .from('pos_order')
    .select('date_order')
    .order('date_order', { ascending: false })
    .limit(1)
    .single();

  if (!maxError && maxDate) {
    const lastDate = new Date(maxDate.date_order);
    const today = new Date();
    const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    console.log('📅 آخر تاريخ في قاعدة البيانات:');
    console.log(`   ${lastDate.toLocaleDateString('ar-SA')} ${lastDate.toLocaleTimeString('ar-SA')}`);
    console.log(`   الفرق عن اليوم: ${daysDiff} يوم`);
    console.log('');

    if (daysDiff > 1) {
      console.log('⚠️  تحذير: البيانات قديمة! آخر طلب من ${daysDiff} يوم');
      console.log('   يجب سحب بيانات جديدة من Aumet/Odoo');
    } else {
      console.log('✅ البيانات محدثة!');
    }
  }

  // 3. إحصائيات عامة
  const { count: totalOrders } = await supabase
    .from('pos_order')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 إحصائيات عامة:');
  console.log(`   إجمالي الطلبات: ${totalOrders?.toLocaleString('ar-SA')}`);
}

checkLatestSales().catch(console.error);
