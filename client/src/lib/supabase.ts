/**
 * Supabase Client للـ Frontend
 * يستخدم جميع الجداول الحقيقية من Odoo ERP
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@shared/supabase';

// استخدام Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || SUPABASE_CONFIG.url;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;

// إنشاء Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ====================================
// Database Views - للإحصائيات السريعة
// ====================================

/**
 * الحصول على إحصائيات Dashboard من View
 */
export async function getDashboardStats() {
  try {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

/**
 * الحصول على المبيعات حسب الشهر من View
 */
export async function getSalesByMonth() {
  try {
    const { data, error } = await supabase
      .from('sales_by_month')
      .select('*')
      .order('month', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales by month:', error);
    return [];
  }
}

/**
 * الحصول على المنتجات حسب الفئة من View
 */
export async function getProductsByCategory() {
  try {
    const { data, error} = await supabase
      .from('products_by_category')
      .select('*')
      .order('product_count', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * الحصول على أفضل المنتجات من View
 */
export async function getTopProducts(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('top_products')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
}

/**
 * الحصول على المخزون المنخفض من View
 */
export async function getLowStockProducts() {
  try {
    const { data, error } = await supabase
      .from('low_stock_products')
      .select('*')
      .order('quantity', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
}

/**
 * الحصول على أفضل العملاء من View
 */
export async function getTopCustomers(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('top_customers')
      .select('*')
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top customers:', error);
    return [];
  }
}

// ====================================
// pos_order - طلبات المبيعات
// ====================================

export interface PosOrder {
  id: number;
  name: string;
  date_order: string;
  amount_total: number;
  state: string;
  partner_id: number;
  session_id: number;
}

/**
 * الحصول على جميع طلبات المبيعات
 */
export async function getAllPosOrders(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('pos_order')
      .select('*')
      .order('date_order', { ascending: false })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pos orders:', error);
    return [];
  }
}

/**
 * الحصول على إحصائيات المبيعات
 */
export async function getSalesStats() {
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

// ====================================
// pos_order_line - تفاصيل الطلبات
// ====================================

export interface PosOrderLine {
  id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price_unit: number;
  price_subtotal: number;
  price_subtotal_incl: number;
}

/**
 * الحصول على تفاصيل طلب معين
 */
export async function getPosOrderLines(orderId: number) {
  try {
    const { data, error } = await supabase
      .from('pos_order_line')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pos order lines:', error);
    return [];
  }
}

// ====================================
// res_partner - العملاء والموردين
// ====================================

export interface ResPartner {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  city?: string;
  country_id?: number;
  is_company: boolean;
  customer_rank: number;
  supplier_rank: number;
}

/**
 * الحصول على جميع العملاء
 */
export async function getAllCustomers(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .gt('customer_rank', 0)
      .order('name', { ascending: true })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * الحصول على عدد العملاء
 */
export async function getCustomersCount() {
  try {
    const { count, error } = await supabase
      .from('res_partner')
      .select('*', { count: 'exact', head: true })
      .gt('customer_rank', 0);
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching customers count:', error);
    return 0;
  }
}

/**
 * الحصول على جميع الموردين
 */
export async function getAllSuppliers(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .gt('supplier_rank', 0)
      .order('name', { ascending: true })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

// ====================================
// product_template - المنتجات
// ====================================

export interface ProductTemplate {
  id: number;
  name: string;
  default_code?: string;
  list_price: number;
  standard_price: number;
  categ_id?: number;
  type: string;
  qty_available?: number;
}

/**
 * الحصول على جميع المنتجات
 */
export async function getAllProducts(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('product_template')
      .select('*')
      .order('name', { ascending: true })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * الحصول على عدد المنتجات
 */
export async function getProductsCount() {
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

// ====================================
// product_category - فئات المنتجات
// ====================================

export interface ProductCategory {
  id: number;
  name: string;
  parent_id?: number;
}

/**
 * الحصول على جميع فئات المنتجات
 */
export async function getAllProductCategories() {
  try {
    const { data, error } = await supabase
      .from('product_category')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
}

// ====================================
// stock_quant - المخزون
// ====================================

export interface StockQuant {
  id: number;
  product_id: number;
  location_id: number;
  quantity: number;
  reserved_quantity: number;
}

/**
 * الحصول على جميع المخزون
 */
export async function getAllStockQuants(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('stock_quant')
      .select('*')
      .order('quantity', { ascending: false })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching stock quants:', error);
    return [];
  }
}

/**
 * الحصول على إجمالي كمية المخزون
 */
export async function getTotalInventory() {
  try {
    const { data, error } = await supabase
      .from('stock_quant')
      .select('quantity')
      .range(0, 29999);
    
    if (error) throw error;
    return data?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0;
  } catch (error) {
    console.error('Error fetching total inventory:', error);
    return 0;
  }
}

// ====================================
// purchase_order - طلبات الشراء
// ====================================

export interface PurchaseOrder {
  id: number;
  name: string;
  date_order: string;
  partner_id: number;
  amount_total: number;
  state: string;
}

/**
 * الحصول على جميع طلبات الشراء
 */
export async function getAllPurchaseOrders(limit = 30000) {
  try {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*')
      .order('date_order', { ascending: false })
      .range(0, limit - 1);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
}

// ====================================
// purchase_order_line - تفاصيل طلبات الشراء
// ====================================

export interface PurchaseOrderLine {
  id: number;
  order_id: number;
  product_id: number;
  product_qty: number;
  price_unit: number;
  price_subtotal: number;
}

/**
 * الحصول على تفاصيل طلب شراء معين
 */
export async function getPurchaseOrderLines(orderId: number) {
  try {
    const { data, error } = await supabase
      .from('purchase_order_line')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase order lines:', error);
    return [];
  }
}
