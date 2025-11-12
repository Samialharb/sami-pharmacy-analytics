/**
 * Supabase Client للـ Frontend
 * يستخدم Environment Variables من Vite
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@shared/supabase';

// استخدام Environment Variables إذا كانت موجودة، وإلا استخدام القيم الافتراضية
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// إنشاء Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * أنواع البيانات
 */
export interface SalesOrder {
  id: string;
  aumet_id: number;
  name: string;
  partner_id: number | null;
  amount_total: number;
  state: string;
  date_order: string;
  customer_aumet_id: number | null;
  is_completed: boolean;
  is_draft: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  aumet_id: number;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  country_id: number | null;
  created_at: string;
}

export interface Product {
  id: string;
  aumet_id: number;
  name: string;
  default_code: string | null;
  list_price: number;
  standard_price: number;
  qty_available: number;
  categ_id: number | null;
  created_at: string;
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  draftOrders: number;
}

/**
 * الحصول على إحصائيات المبيعات
 */
export async function getSalesStats(): Promise<SalesStats> {
  try {
    const { data: orders, error } = await supabase
      .from('aumet_sales_orders')
      .select('amount_total, is_completed, is_draft');

    if (error) throw error;

    const totalSales = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const completedOrders = orders?.filter(o => o.is_completed).length || 0;
    const draftOrders = orders?.filter(o => o.is_draft).length || 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      completedOrders,
      draftOrders,
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      draftOrders: 0,
    };
  }
}

/**
 * الحصول على جميع طلبات المبيعات
 */
export async function getAllSalesOrders(): Promise<SalesOrder[]> {
  try {
    const { data, error } = await supabase
      .from('aumet_sales_orders')
      .select('*')
      .order('date_order', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return [];
  }
}

/**
 * الحصول على جميع العملاء
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('aumet_customers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * الحصول على جميع المنتجات
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('aumet_products')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * الحصول على عدد العملاء
 */
export async function getCustomersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('aumet_customers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching customers count:', error);
    return 0;
  }
}

/**
 * الحصول على عدد المنتجات
 */
export async function getProductsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('aumet_products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching products count:', error);
    return 0;
  }
}

/**
 * الحصول على إجمالي كمية المخزون
 */
export async function getTotalInventory(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('aumet_products')
      .select('qty_available');

    if (error) throw error;
    return data?.reduce((sum, product) => sum + (product.qty_available || 0), 0) || 0;
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    return 0;
  }
}
