/**
 * دوال Supabase للتواصل مع قاعدة البيانات
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, type SalesOrder, type ReportFilters, type SalesStats } from '../shared/supabase';

// إنشاء عميل Supabase
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

/**
 * الحصول على جميع طلبات المبيعات
 */
export async function getAllSalesOrders(): Promise<SalesOrder[]> {
  const { data, error } = await supabase
    .from('aumet_sales_orders')
    .select('*')
    .order('date_order', { ascending: false });

  if (error) {
    console.error('Error fetching sales orders:', error);
    throw error;
  }

  return data || [];
}

/**
 * الحصول على طلبات المبيعات مع فلاتر
 */
export async function getSalesOrdersWithFilters(filters: ReportFilters): Promise<SalesOrder[]> {
  let query = supabase
    .from('aumet_sales_orders')
    .select('*');

  // تطبيق الفلاتر
  if (filters.startDate) {
    query = query.gte('date_order', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('date_order', filters.endDate);
  }

  if (filters.state) {
    query = query.eq('state', filters.state);
  }

  if (filters.minAmount !== undefined) {
    query = query.gte('amount_total', filters.minAmount);
  }

  if (filters.maxAmount !== undefined) {
    query = query.lte('amount_total', filters.maxAmount);
  }

  query = query.order('date_order', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching filtered sales orders:', error);
    throw error;
  }

  return data || [];
}

/**
 * حساب إحصائيات المبيعات
 */
export async function calculateSalesStats(filters?: ReportFilters): Promise<SalesStats> {
  const orders = filters 
    ? await getSalesOrdersWithFilters(filters)
    : await getAllSalesOrders();

  const totalSales = orders.reduce((sum, order) => sum + order.amount_total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const completedOrders = orders.filter(o => o.is_completed).length;
  const draftOrders = orders.filter(o => o.is_draft).length;

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    completedOrders,
    draftOrders
  };
}

/**
 * الحصول على المبيعات اليومية
 */
export async function getDailySales(date: string): Promise<SalesOrder[]> {
  const { data, error } = await supabase
    .from('aumet_sales_orders')
    .select('*')
    .gte('date_order', `${date} 00:00:00`)
    .lte('date_order', `${date} 23:59:59`)
    .order('date_order', { ascending: false });

  if (error) {
    console.error('Error fetching daily sales:', error);
    throw error;
  }

  return data || [];
}

/**
 * الحصول على المبيعات الشهرية
 */
export async function getMonthlySales(year: number, month: number): Promise<SalesOrder[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // آخر يوم في الشهر

  const { data, error } = await supabase
    .from('aumet_sales_orders')
    .select('*')
    .gte('date_order', startDate)
    .lte('date_order', `${endDate} 23:59:59`)
    .order('date_order', { ascending: false });

  if (error) {
    console.error('Error fetching monthly sales:', error);
    throw error;
  }

  return data || [];
}

/**
 * الحصول على المبيعات السنوية
 */
export async function getYearlySales(year: number): Promise<SalesOrder[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('aumet_sales_orders')
    .select('*')
    .gte('date_order', startDate)
    .lte('date_order', `${endDate} 23:59:59`)
    .order('date_order', { ascending: false});

  if (error) {
    console.error('Error fetching yearly sales:', error);
    throw error;
  }

  return data || [];
}
