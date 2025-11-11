/**
 * خدمة الاتصال بـ Odoo ERP
 * توفر واجهات للتواصل مع Odoo وسحب البيانات
 */

import axios, { AxiosInstance } from 'axios';

interface OdooConfig {
  baseUrl: string;
  database: string;
  username: string;
  password: string;
}

interface OdooResponse<T> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data: any;
  };
}

class OdooService {
  private client: AxiosInstance;
  private config: OdooConfig;
  private sessionId: string | null = null;

  constructor(config: OdooConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * تسجيل الدخول إلى Odoo
   */
  async authenticate(): Promise<boolean> {
    try {
      const response = await this.client.post<OdooResponse<any>>('/web/session/authenticate', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          db: this.config.database,
          login: this.config.username,
          password: this.config.password,
        },
        id: Math.random(),
      });

      if (response.data.result) {
        this.sessionId = response.data.result.session_id;
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في المصادقة:', error);
      return false;
    }
  }

  /**
   * استدعاء رسالة Odoo
   */
  private async callMethod(model: string, method: string, args: any[] = [], kwargs: any = {}): Promise<any> {
    try {
      const response = await this.client.post<OdooResponse<any>>('/web/dataset/call_kw', {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model,
          method,
          args,
          kwargs,
        },
        id: Math.random(),
      });

      if (response.data.error) {
        throw new Error(response.data.error.message);
      }

      return response.data.result;
    } catch (error) {
      console.error(`خطأ في استدعاء ${model}.${method}:`, error);
      throw error;
    }
  }

  /**
   * سحب بيانات المبيعات
   */
  async getSalesOrders(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const orders = await this.callMethod(
        'sale.order',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'partner_id', 'date_order', 'amount_total', 'state'],
          limit,
          offset,
        }
      );
      return orders;
    } catch (error) {
      console.error('خطأ في سحب بيانات المبيعات:', error);
      return [];
    }
  }

  /**
   * سحب بيانات المشتريات
   */
  async getPurchaseOrders(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const orders = await this.callMethod(
        'purchase.order',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'partner_id', 'date_order', 'amount_total', 'state'],
          limit,
          offset,
        }
      );
      return orders;
    } catch (error) {
      console.error('خطأ في سحب بيانات المشتريات:', error);
      return [];
    }
  }

  /**
   * سحب بيانات المخزون
   */
  async getInventoryItems(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const items = await this.callMethod(
        'stock.quant',
        'search_read',
        [],
        {
          fields: ['id', 'product_id', 'quantity', 'location_id', 'company_id'],
          limit,
          offset,
        }
      );
      return items;
    } catch (error) {
      console.error('خطأ في سحب بيانات المخزون:', error);
      return [];
    }
  }

  /**
   * سحب بيانات العملاء
   */
  async getCustomers(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const customers = await this.callMethod(
        'res.partner',
        'search_read',
        [['customer_rank', '>', 0]],
        {
          fields: ['id', 'name', 'email', 'phone', 'city', 'country_id'],
          limit,
          offset,
        }
      );
      return customers;
    } catch (error) {
      console.error('خطأ في سحب بيانات العملاء:', error);
      return [];
    }
  }

  /**
   * سحب بيانات الموردين
   */
  async getSuppliers(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const suppliers = await this.callMethod(
        'res.partner',
        'search_read',
        [['supplier_rank', '>', 0]],
        {
          fields: ['id', 'name', 'email', 'phone', 'city', 'country_id'],
          limit,
          offset,
        }
      );
      return suppliers;
    } catch (error) {
      console.error('خطأ في سحب بيانات الموردين:', error);
      return [];
    }
  }

  /**
   * سحب بيانات المنتجات
   */
  async getProducts(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const products = await this.callMethod(
        'product.product',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'list_price', 'standard_price', 'qty_available', 'category_id'],
          limit,
          offset,
        }
      );
      return products;
    } catch (error) {
      console.error('خطأ في سحب بيانات المنتجات:', error);
      return [];
    }
  }

  /**
   * سحب بيانات الفواتير
   */
  async getInvoices(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const invoices = await this.callMethod(
        'account.move',
        'search_read',
        [['move_type', '=', 'out_invoice']],
        {
          fields: ['id', 'name', 'partner_id', 'invoice_date', 'amount_total', 'state'],
          limit,
          offset,
        }
      );
      return invoices;
    } catch (error) {
      console.error('خطأ في سحب بيانات الفواتير:', error);
      return [];
    }
  }

  /**
   * سحب بيانات المدفوعات
   */
  async getPayments(limit: number = 100, offset: number = 0): Promise<any[]> {
    try {
      const payments = await this.callMethod(
        'account.payment',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'partner_id', 'payment_date', 'amount', 'state'],
          limit,
          offset,
        }
      );
      return payments;
    } catch (error) {
      console.error('خطأ في سحب بيانات المدفوعات:', error);
      return [];
    }
  }

  /**
   * سحب بيانات المحاسبة
   */
  async getFinancialData(): Promise<any> {
    try {
      const data = await this.callMethod(
        'account.account',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'code', 'balance', 'debit', 'credit'],
        }
      );
      return data;
    } catch (error) {
      console.error('خطأ في سحب البيانات المالية:', error);
      return [];
    }
  }

  /**
   * حساب إجمالي المبيعات
   */
  async getTotalSales(startDate?: string, endDate?: string): Promise<number> {
    try {
      const domain = [];
      if (startDate) domain.push(['date_order', '>=', startDate]);
      if (endDate) domain.push(['date_order', '<=', endDate]);

      const result = await this.callMethod(
        'sale.order',
        'read_group',
        [domain],
        {
          fields: ['amount_total'],
          groupby: [],
        }
      );

      return result[0]?.amount_total || 0;
    } catch (error) {
      console.error('خطأ في حساب إجمالي المبيعات:', error);
      return 0;
    }
  }

  /**
   * حساب إجمالي المشتريات
   */
  async getTotalPurchases(startDate?: string, endDate?: string): Promise<number> {
    try {
      const domain = [];
      if (startDate) domain.push(['date_order', '>=', startDate]);
      if (endDate) domain.push(['date_order', '<=', endDate]);

      const result = await this.callMethod(
        'purchase.order',
        'read_group',
        [domain],
        {
          fields: ['amount_total'],
          groupby: [],
        }
      );

      return result[0]?.amount_total || 0;
    } catch (error) {
      console.error('خطأ في حساب إجمالي المشتريات:', error);
      return 0;
    }
  }

  /**
   * الحصول على عدد العملاء
   */
  async getCustomerCount(): Promise<number> {
    try {
      const count = await this.callMethod(
        'res.partner',
        'search_count',
        [['customer_rank', '>', 0]]
      );
      return count;
    } catch (error) {
      console.error('خطأ في حساب عدد العملاء:', error);
      return 0;
    }
  }

  /**
   * الحصول على عدد المنتجات
   */
  async getProductCount(): Promise<number> {
    try {
      const count = await this.callMethod(
        'product.product',
        'search_count',
        []
      );
      return count;
    } catch (error) {
      console.error('خطأ في حساب عدد المنتجات:', error);
      return 0;
    }
  }
}

export default OdooService;
