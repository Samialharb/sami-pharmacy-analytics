import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://ajcbqdlpovpxbzltbjfl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====================================
// Sales Orders (pos_order)
// ====================================
export const fetchSalesOrders = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('pos_order')
      .select('*')
      .order('date_order', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return [];
  }
};

// ====================================
// Purchase Orders
// ====================================
export const fetchPurchaseOrders = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*')
      .order('date_order', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

// ====================================
// Inventory (stock_quant)
// ====================================
export const fetchInventory = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('stock_quant')
      .select('*, product_id(*)')
      .order('product_id', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
};

// ====================================
// Customers & Partners (res_partner)
// ====================================
export const fetchCustomers = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .gt('customer_rank', 0)
      .order('name', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

// ====================================
// Suppliers (res_partner)
// ====================================
export const fetchSuppliers = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('res_partner')
      .select('*')
      .gt('supplier_rank', 0)
      .order('name', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
};

// ====================================
// Products (product_template)
// ====================================
export const fetchProducts = async (limit = 1000) => {
  try {
    const { data, error } = await supabase
      .from('product_template')
      .select('*')
      .order('name', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// ====================================
// Product Categories
// ====================================
export const fetchProductCategories = async () => {
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
};

// ====================================
// Analytics & Statistics
// ====================================
export const fetchDashboardStats = async () => {
  try {
    // Get total sales
    const { data: salesData, error: salesError } = await supabase
      .from('pos_order')
      .select('amount_total')
      .eq('state', 'paid');
    
    if (salesError) throw salesError;
    
    const totalSales = salesData?.reduce((sum, order) => sum + (order.amount_total || 0), 0) || 0;
    
    // Get total customers
    const { count: customersCount, error: customersError } = await supabase
      .from('res_partner')
      .select('*', { count: 'exact', head: true })
      .gt('customer_rank', 0);
    
    if (customersError) throw customersError;
    
    // Get total products
    const { count: productsCount, error: productsError } = await supabase
      .from('product_template')
      .select('*', { count: 'exact', head: true });
    
    if (productsError) throw productsError;
    
    // Get total orders
    const { count: ordersCount, error: ordersError } = await supabase
      .from('pos_order')
      .select('*', { count: 'exact', head: true });
    
    if (ordersError) throw ordersError;
    
    return {
      totalSales,
      totalCustomers: customersCount || 0,
      totalProducts: productsCount || 0,
      totalOrders: ordersCount || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalSales: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalOrders: 0
    };
  }
};

// ====================================
// Recent Sales Orders
// ====================================
export const fetchRecentOrders = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('pos_order')
      .select('*')
      .order('date_order', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
};

// ====================================
// Top Products by Sales
// ====================================
export const fetchTopProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('product_template')
      .select('*')
      .order('sales_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
};

// ====================================
// Low Stock Products
// ====================================
export const fetchLowStockProducts = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('stock_quant')
      .select('*, product_id(*)')
      .lt('quantity', 10)
      .order('quantity', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    return [];
  }
};

// ====================================
// Sales by Month (for charts)
// ====================================
export const fetchSalesByMonth = async () => {
  try {
    const { data, error } = await supabase
      .from('pos_order')
      .select('date_order, amount_total')
      .eq('state', 'paid')
      .order('date_order', { ascending: true });
    
    if (error) throw error;
    
    // Group by month
    const salesByMonth: { [key: string]: number } = {};
    data?.forEach(order => {
      if (order.date_order) {
        const month = order.date_order.substring(0, 7); // YYYY-MM
        salesByMonth[month] = (salesByMonth[month] || 0) + (order.amount_total || 0);
      }
    });
    
    return Object.entries(salesByMonth).map(([month, total]) => ({
      month,
      total
    }));
  } catch (error) {
    console.error('Error fetching sales by month:', error);
    return [];
  }
};
