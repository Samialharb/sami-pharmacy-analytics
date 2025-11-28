/**
 * Supabase Client للـ Frontend
 * يستخدم Environment Variables من Vite
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@shared/supabase';

// استخدام Environment Variables إذا كانت موجودة، وإلا استخدام القيم الافتراضية
// يدعم كلاً من VITE_ prefix (للتطوير المحلي) وبدون prefix (لـ Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

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
      .from('pos_order')
      .select('amount_total, state')
      .range(0, 29999);

    if (error) throw error;

    const totalSales = orders?.reduce((sum, order) => sum + (Number(order.amount_total) || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const completedOrders = orders?.filter(o => o.state === 'paid' || o.state === 'done' || o.state === 'invoiced').length || 0;
    const draftOrders = orders?.filter(o => o.state === 'draft').length || 0;

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
    let allOrders: SalesOrder[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    let pageCount = 0;

    console.log('🔄 Starting to fetch sales orders...');

    while (hasMore && pageCount < 30) { // حد أقصى 30 صفحة (30,000 سجل)
      console.log(`📥 Fetching page ${pageCount + 1}, from ${from} to ${from + pageSize - 1}`);
      
      const { data, error } = await supabase
        .from('pos_order')
        .select('*')
        .order('date_order', { ascending: false })
        .range(from, from + pageSize - 1);

      if (error) {
        console.error('❌ Error fetching page:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Fetched ${data.length} orders, total so far: ${allOrders.length + data.length}`);
        allOrders = [...allOrders, ...data];
        from += pageSize;
        hasMore = data.length === pageSize;
        pageCount++;
      } else {
        console.log('🏁 No more data to fetch');
        hasMore = false;
      }
    }

    console.log(`🎉 Finished! Total orders fetched: ${allOrders.length}`);
    return allOrders;
  } catch (error) {
    console.error('❌ Error fetching sales orders:', error);
    return [];
  }
}

/**
 * الحصول على جميع العملاء
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .order('name', { ascending: true })
      .range(0, 29999);

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
      .from('product_template')
      .select('*')
      .order('name', { ascending: true })
      .range(0, 29999);

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
      .from('res_partner')
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
      .from('product_template')
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
      .from('product_template')
      .select('qty_available')
      .range(0, 29999);

    if (error) throw error;
    return data?.reduce((sum, product) => sum + (product.qty_available || 0), 0) || 0;
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    return 0;
  }
}

/**
 * Supplier interface
 */
export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
}

/**
 * Get all suppliers
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

/**
 * Get suppliers count
 */
export async function getSuppliersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching suppliers count:', error);
    return 0;
  }
}
