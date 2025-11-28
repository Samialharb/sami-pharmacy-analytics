/**
 * إعدادات Supabase
 */

// استخدام environment variables في production (Vercel)
// أو القيم الافتراضية في development
export const SUPABASE_CONFIG = {
  url: typeof window !== 'undefined' 
    ? (import.meta.env.VITE_SUPABASE_URL || 'https://ajcbqdlpovpxbzltbjfl.supabase.co')
    : 'https://ajcbqdlpovpxbzltbjfl.supabase.co',
  anonKey: typeof window !== 'undefined'
    ? (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.Ux7QLuPABFH9Ky8wNxmGbMsqNGTKpEQD2TKJWPIAr9A')
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.Ux7QLuPABFH9Ky8wNxmGbMsqNGTKpEQD2TKJWPIAr9A'
} as const;

/**
 * أنواع بيانات طلبات المبيعات
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

/**
 * فلاتر التقارير
 */
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  state?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * إحصائيات المبيعات
 */
export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  draftOrders: number;
}
