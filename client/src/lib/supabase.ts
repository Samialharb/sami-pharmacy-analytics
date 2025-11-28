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
 * الحصول على إحصائيات المبيعات من pos_order (الجدول الحقيقي)
 */
export async function getSalesStats(): Promise<SalesStats> {
  try {
    const { data: orders, error } = await supabase
      .from('pos_order')
      .select('amount_total, state')
      .range(0, 29999);

    if (error) throw error;

    const totalSales = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;
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
 * الحصول على جميع طلبات المبيعات من pos_order (الجدول الحقيقي)
 */
export async function getAllSalesOrders(): Promise<SalesOrder[]> {
  try {
    let allOrders: any[] = [];
    let from = 0;
    const pageSize = 1000;
    let hasMore = true;
    let pageCount = 0;

    console.log('🔄 Starting to fetch sales orders from pos_order...');

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
        // تحويل البيانات للواجهة المتوقعة
        const mappedData = data.map(order => ({
          id: order.id?.toString() || '',
          aumet_id: order.id || 0,
          name: order.name || '',
          partner_id: order.partner_id || null,
          amount_total: order.amount_total || 0,
          state: order.state || '',
          date_order: order.date_order || '',
          customer_aumet_id: order.partner_id || null,
          is_completed: order.state === 'paid' || order.state === 'done' || order.state === 'invoiced',
          is_draft: order.state === 'draft',
          created_at: order.create_date || order.date_order || '',
        }));
        allOrders = [...allOrders, ...mappedData];
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
 * الحصول على جميع العملاء من res_partner (الجدول الحقيقي)
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .order('name', { ascending: true })
      .range(0, 29999);

    if (error) throw error;
    
    // تحويل البيانات للواجهة المتوقعة
    const mappedData = data?.map(partner => ({
      id: partner.id?.toString() || '',
      aumet_id: partner.id || 0,
      name: partner.name || '',
      email: partner.email || null,
      phone: partner.phone || partner.mobile || null,
      city: partner.city || null,
      country_id: partner.country_id || null,
      created_at: partner.create_date || '',
    })) || [];
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}

/**
 * الحصول على جميع المنتجات من product_template (الجدول الحقيقي)
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('product_template')
      .select('*')
      .order('name', { ascending: true })
      .range(0, 29999);

    if (error) throw error;
    
    // تحويل البيانات للواجهة المتوقعة
    const mappedData = data?.map(product => ({
      id: product.id?.toString() || '',
      aumet_id: product.id || 0,
      name: product.name || '',
      default_code: product.default_code || null,
      list_price: product.list_price || 0,
      standard_price: product.standard_price || 0,
      qty_available: product.qty_available || 0,
      categ_id: product.categ_id || null,
      created_at: product.create_date || '',
    })) || [];
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * الحصول على عدد العملاء من res_partner
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
 * الحصول على عدد المنتجات من product_template
 */
export async function getProductsCount(): Promise<number> {
  try {
    const { count, error} = await supabase
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
 * الحصول على إجمالي كمية المخزون من stock_quant
 */
export async function getTotalInventory(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('stock_quant')
      .select('quantity')
      .range(0, 29999);

    if (error) throw error;
    return data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
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
 * Get all suppliers من res_partner (الموردين)
 */
export async function getAllSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .eq('supplier_rank', 1)
      .order('name', { ascending: true })
      .range(0, 9999);

    if (error) throw error;
    
    // تحويل البيانات للواجهة المتوقعة
    const mappedData = data?.map(partner => ({
      id: partner.id?.toString() || '',
      name: partner.name || '',
      contact_person: partner.contact_name || null,
      phone: partner.phone || partner.mobile || null,
      email: partner.email || null,
      address: partner.street || null,
      created_at: partner.create_date || '',
    })) || [];
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
}

/**
 * Get suppliers count من res_partner
 */
export async function getSuppliersCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('res_partner')
      .select('*', { count: 'exact', head: true })
      .eq('supplier_rank', 1);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching suppliers count:', error);
    return 0;
  }
}

/**
 * Purchase Order interface
 */
export interface PurchaseOrder {
  id: string;
  aumet_id: number;
  name: string;
  partner_id: number | null;
  supplier_name: string | null;
  amount_total: number;
  state: string;
  date_order: string;
  date_approve: string | null;
  created_at: string;
}

/**
 * Purchase Stats interface
 */
export interface PurchaseStats {
  totalPurchases: number;
  totalOrders: number;
  averageOrderValue: number;
  confirmedOrders: number;
  draftOrders: number;
}

/**
 * الحصول على إحصائيات المشتريات من purchase_order
 */
export async function getPurchaseStats(): Promise<PurchaseStats> {
  try {
    const { data: orders, error } = await supabase
      .from('purchase_order')
      .select('amount_total, state')
      .range(0, 9999);

    if (error) throw error;

    const totalPurchases = orders?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalPurchases / totalOrders : 0;
    const confirmedOrders = orders?.filter(o => o.state === 'purchase' || o.state === 'done').length || 0;
    const draftOrders = orders?.filter(o => o.state === 'draft').length || 0;

    return {
      totalPurchases,
      totalOrders,
      averageOrderValue,
      confirmedOrders,
      draftOrders,
    };
  } catch (error) {
    console.error('Error fetching purchase stats:', error);
    return {
      totalPurchases: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      confirmedOrders: 0,
      draftOrders: 0,
    };
  }
}

/**
 * الحصول على جميع طلبات الشراء من purchase_order
 */
export async function getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
  try {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*')
      .order('date_order', { ascending: false })
      .range(0, 9999);

    if (error) throw error;
    
    // تحويل البيانات للواجهة المتوقعة
    const mappedData = data?.map(order => ({
      id: order.id?.toString() || '',
      aumet_id: order.id || 0,
      name: order.name || '',
      partner_id: order.partner_id || null,
      supplier_name: order.partner_id ? `مورد #${order.partner_id}` : null,
      amount_total: order.amount_total || 0,
      state: order.state || '',
      date_order: order.date_order || '',
      date_approve: order.date_approve || null,
      created_at: order.create_date || order.date_order || '',
    })) || [];
    
    return mappedData;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
}

/**
 * الحصول على أفضل الموردين حسب المشتريات
 */
export async function getTopSuppliers(limit: number = 10): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('partner_id, amount_total')
      .not('partner_id', 'is', null)
      .range(0, 9999);

    if (error) throw error;

    // تجميع البيانات حسب المورد
    const supplierMap = new Map();
    data?.forEach(order => {
      const supplierId = order.partner_id;
      if (supplierId) {
        const current = supplierMap.get(supplierId) || { totalAmount: 0, orderCount: 0 };
        supplierMap.set(supplierId, {
          totalAmount: current.totalAmount + (order.amount_total || 0),
          orderCount: current.orderCount + 1,
        });
      }
    });

    // تحويل إلى مصفوفة وترتيب
    const suppliers = Array.from(supplierMap.entries())
      .map(([supplierId, stats]) => ({
        supplier_id: supplierId,
        supplier_name: `مورد #${supplierId}`,
        total_amount: stats.totalAmount,
        order_count: stats.orderCount,
      }))
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, limit);

    return suppliers;
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    return [];
  }
}
