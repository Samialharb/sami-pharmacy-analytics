/**
 * API Endpoints للبيانات
 * توفر endpoints tRPC للوصول إلى البيانات من Odoo
 */

import { router, publicProcedure } from './trpc';
import OdooService from './odoo-service';
import { z } from 'zod';

// إنشاء خدمة Odoo
const odooService = new OdooService({
  baseUrl: process.env.ODOO_URL || 'http://localhost:8069',
  database: process.env.ODOO_DB || 'sami_pharmacy',
  username: process.env.ODOO_USERNAME || 'admin',
  password: process.env.ODOO_PASSWORD || 'admin',
});

/**
 * Router للبيانات
 */
export const dataRouter = router({
  // المبيعات
  sales: router({
    getOrders: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const orders = await odooService.getSalesOrders(input.limit, input.offset);
          return {
            success: true,
            data: orders,
            count: orders.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات المبيعات',
            data: [],
          };
        }
      }),

    getTotal: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const total = await odooService.getTotalSales(input.startDate, input.endDate);
          return {
            success: true,
            total,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في حساب إجمالي المبيعات',
            total: 0,
          };
        }
      }),
  }),

  // المشتريات
  purchases: router({
    getOrders: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const orders = await odooService.getPurchaseOrders(input.limit, input.offset);
          return {
            success: true,
            data: orders,
            count: orders.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات المشتريات',
            data: [],
          };
        }
      }),

    getTotal: publicProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          const total = await odooService.getTotalPurchases(input.startDate, input.endDate);
          return {
            success: true,
            total,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في حساب إجمالي المشتريات',
            total: 0,
          };
        }
      }),
  }),

  // المخزون
  inventory: router({
    getItems: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const items = await odooService.getInventoryItems(input.limit, input.offset);
          return {
            success: true,
            data: items,
            count: items.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات المخزون',
            data: [],
          };
        }
      }),
  }),

  // العملاء
  customers: router({
    getAll: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const customers = await odooService.getCustomers(input.limit, input.offset);
          return {
            success: true,
            data: customers,
            count: customers.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات العملاء',
            data: [],
          };
        }
      }),

    getCount: publicProcedure.query(async () => {
      try {
        const count = await odooService.getCustomerCount();
        return {
          success: true,
          count,
        };
      } catch (error) {
        return {
          success: false,
          error: 'خطأ في حساب عدد العملاء',
          count: 0,
        };
      }
    }),
  }),

  // الموردين
  suppliers: router({
    getAll: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const suppliers = await odooService.getSuppliers(input.limit, input.offset);
          return {
            success: true,
            data: suppliers,
            count: suppliers.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات الموردين',
            data: [],
          };
        }
      }),
  }),

  // المنتجات
  products: router({
    getAll: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const products = await odooService.getProducts(input.limit, input.offset);
          return {
            success: true,
            data: products,
            count: products.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات المنتجات',
            data: [],
          };
        }
      }),

    getCount: publicProcedure.query(async () => {
      try {
        const count = await odooService.getProductCount();
        return {
          success: true,
          count,
        };
      } catch (error) {
        return {
          success: false,
          error: 'خطأ في حساب عدد المنتجات',
          count: 0,
        };
      }
    }),
  }),

  // الفواتير
  invoices: router({
    getAll: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const invoices = await odooService.getInvoices(input.limit, input.offset);
          return {
            success: true,
            data: invoices,
            count: invoices.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات الفواتير',
            data: [],
          };
        }
      }),
  }),

  // المدفوعات
  payments: router({
    getAll: publicProcedure
      .input(z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        try {
          const payments = await odooService.getPayments(input.limit, input.offset);
          return {
            success: true,
            data: payments,
            count: payments.length,
          };
        } catch (error) {
          return {
            success: false,
            error: 'خطأ في سحب بيانات المدفوعات',
            data: [],
          };
        }
      }),
  }),

  // البيانات المالية
  financial: router({
    getData: publicProcedure.query(async () => {
      try {
        const data = await odooService.getFinancialData();
        return {
          success: true,
          data,
        };
      } catch (error) {
        return {
          success: false,
          error: 'خطأ في سحب البيانات المالية',
          data: [],
        };
      }
    }),
  }),

  // الإحصائيات العامة
  statistics: router({
    getSummary: publicProcedure.query(async () => {
      try {
        const [totalSales, totalPurchases, customerCount, productCount] = await Promise.all([
          odooService.getTotalSales(),
          odooService.getTotalPurchases(),
          odooService.getCustomerCount(),
          odooService.getProductCount(),
        ]);

        return {
          success: true,
          data: {
            totalSales,
            totalPurchases,
            customerCount,
            productCount,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: 'خطأ في سحب الإحصائيات',
          data: {},
        };
      }
    }),
  }),
});

export default dataRouter;
