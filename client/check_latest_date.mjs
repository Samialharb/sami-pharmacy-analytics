import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcpxhbqjqxvwgqpxbvdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcHhoYnFqcXh2d2dxcHhidmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5NjM4NzAsImV4cCI6MjA0ODUzOTg3MH0.tT3Ml5H_kH3o8vYEOUnOQNqhAnii3gZqsj-vxqJEKMw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestDate() {
  console.log('🔍 فحص آخر تاريخ في Supabase بالتقويم الميلادي...\n');

  // 1. جلب آخر 5 طلبات
  const { data: orders, error } = await supabase
    .from('pos_order')
    .select('id, name, date_order, amount_total')
    .order('date_order', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ خطأ:', error.message);
    return;
  }

  console.log('📊 آخر 5 طلبات:');
  console.log('=====================================');
  orders.forEach((order, index) => {
    const date = new Date(order.date_order);
    // تنسيق التاريخ بالميلادي: DD/MM/YYYY
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`${index + 1}. ${order.name}`);
    console.log(`   التاريخ: ${formattedDate} ${formattedTime}`);
    console.log(`   المبلغ: ${order.amount_total} ريال`);
    console.log('');
  });

  // 2. حساب الفرق مع اليوم
  const lastOrderDate = new Date(orders[0].date_order);
  const today = new Date();
  const daysDiff = Math.floor((today - lastOrderDate) / (1000 * 60 * 60 * 24));

  const lastDateFormatted = lastOrderDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const todayFormatted = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  console.log('📅 ملخص:');
  console.log('=====================================');
  console.log(`آخر طلب: ${lastDateFormatted}`);
  console.log(`اليوم: ${todayFormatted}`);
  console.log(`الفرق: ${daysDiff} يوم`);
  console.log('');

  if (daysDiff > 1) {
    console.log(`⚠️  تحذير: البيانات قديمة بـ ${daysDiff} يوم!`);
    console.log('   يجب سحب بيانات جديدة من Aumet/Odoo');
  } else if (daysDiff === 1) {
    console.log('⚠️  البيانات من الأمس، قد تحتاج تحديث');
  } else {
    console.log('✅ البيانات محدثة!');
  }
}

checkLatestDate().catch(console.error);
