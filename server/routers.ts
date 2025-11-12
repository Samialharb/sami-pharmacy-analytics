import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as supabaseDb from "./supabase";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // تقارير المبيعات
  sales: router({
    // الحصول على جميع الطلبات
    getAll: publicProcedure.query(async () => {
      return await supabaseDb.getAllSalesOrders();
    }),

    // الحصول على الطلبات مع فلاتر
    getFiltered: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        state: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await supabaseDb.getSalesOrdersWithFilters(input);
      }),

    // حساب الإحصائيات
    getStats: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        state: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await supabaseDb.calculateSalesStats(input);
      }),

    // المبيعات اليومية
    getDaily: publicProcedure
      .input(z.object({
        date: z.string(),
      }))
      .query(async ({ input }) => {
        return await supabaseDb.getDailySales(input.date);
      }),

    // المبيعات الشهرية
    getMonthly: publicProcedure
      .input(z.object({
        year: z.number(),
        month: z.number(),
      }))
      .query(async ({ input }) => {
        return await supabaseDb.getMonthlySales(input.year, input.month);
      }),

    // المبيعات السنوية
    getYearly: publicProcedure
      .input(z.object({
        year: z.number(),
      }))
      .query(async ({ input }) => {
        return await supabaseDb.getYearlySales(input.year);
      }),
  }),

  // تقارير المنتجات
  products: router({
    // الحصول على جميع المنتجات
    getAll: publicProcedure.query(async () => {
      // TODO: استبدال بالبيانات الحقيقية من Supabase بعد المزامنة
      return [
        { id: 1, name: 'باراسيتامول 500 مجم', category: 'مسكنات', sold: 450, revenue: 15000, stock: 120 },
        { id: 2, name: 'أموكسيسيلين 250 مجم', category: 'مضادات حيوية', sold: 380, revenue: 12000, stock: 95 },
        { id: 3, name: 'فيتامين د 1000 وحدة', category: 'فيتامينات', sold: 320, revenue: 10000, stock: 200 },
        { id: 4, name: 'أوميجا 3', category: 'مكملات', sold: 250, revenue: 8000, stock: 150 },
        { id: 5, name: 'كريم مرطب', category: 'عناية بالبشرة', sold: 180, revenue: 5400, stock: 80 },
        { id: 6, name: 'شامبو طبي', category: 'عناية بالشعر', sold: 150, revenue: 4500, stock: 60 },
        { id: 7, name: 'معقم اليدين', category: 'نظافة', sold: 420, revenue: 8400, stock: 200 },
        { id: 8, name: 'فيتامين C', category: 'فيتامينات', sold: 280, revenue: 7000, stock: 150 },
      ];
    }),

    // إحصائيات المنتجات
    getStats: publicProcedure.query(async () => {
      return {
        totalProducts: 500,
        totalRevenue: 70300,
        topProduct: { name: 'باراسيتامول 500 مجم', sold: 450 },
      };
    }),
  }),

  // تقارير العملاء
  customers: router({
    // الحصول على جميع العملاء
    getAll: publicProcedure.query(async () => {
      // TODO: استبدال بالبيانات الحقيقية من Supabase بعد المزامنة
      return [
        { id: 1, name: 'صيدلية النور', city: 'الرياض', phone: '0501234567', orders: 45, revenue: 12000 },
        { id: 2, name: 'صيدلية الشفاء', city: 'جدة', phone: '0507654321', orders: 38, revenue: 9500 },
        { id: 3, name: 'صيدلية الحياة', city: 'الدمام', phone: '0509876543', orders: 32, revenue: 8000 },
        { id: 4, name: 'صيدلية السلام', city: 'الرياض', phone: '0503456789', orders: 28, revenue: 7200 },
        { id: 5, name: 'صيدلية الأمل', city: 'مكة', phone: '0508765432', orders: 25, revenue: 6500 },
        { id: 6, name: 'صيدلية الفجر', city: 'جدة', phone: '0502345678', orders: 22, revenue: 5800 },
        { id: 7, name: 'صيدلية البركة', city: 'الرياض', phone: '0506789012', orders: 20, revenue: 5200 },
      ];
    }),

    // إحصائيات العملاء
    getStats: publicProcedure.query(async () => {
      return {
        totalCustomers: 3377,
        totalRevenue: 54200,
        topCustomer: { name: 'صيدلية النور', orders: 45 },
        byCity: [
          { city: 'الرياض', count: 1250, percentage: 37 },
          { city: 'جدة', count: 980, percentage: 29 },
          { city: 'الدمام', count: 620, percentage: 18 },
          { city: 'مكة', count: 340, percentage: 10 },
          { city: 'المدينة', count: 187, percentage: 6 },
        ],
      };
    }),
  }),

  // تقارير المخزون
  inventory: router({
    // الحصول على جميع المخزون
    getAll: publicProcedure.query(async () => {
      // TODO: استبدال بالبيانات الحقيقية من Supabase بعد المزامنة
      return [
        { id: 1, product: 'باراسيتامول 500 مجم', quantity: 120, minStock: 100, status: 'متوفر', lastUpdate: '2025-11-10' },
        { id: 2, product: 'أموكسيسيلين 250 مجم', quantity: 45, minStock: 50, status: 'منخفض', lastUpdate: '2025-11-10' },
        { id: 3, product: 'فيتامين د 1000 وحدة', quantity: 200, minStock: 80, status: 'متوفر', lastUpdate: '2025-11-11' },
        { id: 4, product: 'أوميجا 3', quantity: 150, minStock: 100, status: 'متوفر', lastUpdate: '2025-11-11' },
        { id: 5, product: 'كريم مرطب', quantity: 30, minStock: 40, status: 'منخفض', lastUpdate: '2025-11-09' },
        { id: 6, product: 'شامبو طبي', quantity: 25, minStock: 30, status: 'منخفض', lastUpdate: '2025-11-09' },
        { id: 7, product: 'معقم اليدين', quantity: 200, minStock: 150, status: 'متوفر', lastUpdate: '2025-11-12' },
        { id: 8, product: 'فيتامين C', quantity: 15, minStock: 50, status: 'منخفض', lastUpdate: '2025-11-08' },
      ];
    }),

    // إحصائيات المخزون
    getStats: publicProcedure.query(async () => {
      return {
        totalItems: 500,
        lowStockCount: 5,
        totalValue: 250000,
      };
    }),

    // تنبيهات المخزون المنخفض
    getLowStock: publicProcedure.query(async () => {
      return [
        { product: 'أموكسيسيلين 250 مجم', quantity: 45, minStock: 50 },
        { product: 'كريم مرطب', quantity: 30, minStock: 40 },
        { product: 'شامبو طبي', quantity: 25, minStock: 30 },
        { product: 'فيتامين C', quantity: 15, minStock: 50 },
        { product: 'إبرة أنسولين', quantity: 10, minStock: 20 },
      ];
    }),
  }),
});

export type AppRouter = typeof appRouter;
