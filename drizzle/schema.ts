import { 
  int, 
  varchar, 
  text, 
  decimal, 
  datetime, 
  boolean,
  mysqlEnum,
  mysqlTable,
  index,
  uniqueIndex
} from 'drizzle-orm/mysql-core';

// ============================================================================
// جداول المبيعات (Sales Tables)
// ============================================================================

export const salesOrders = mysqlTable('sales_orders', {
  id: int('id').primaryKey().autoincrement(),
  orderId: varchar('order_id', { length: 50 }).unique().notNull(),
  customerId: int('customer_id'),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  orderDate: datetime('order_date').notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'confirmed', 'shipped', 'delivered', 'cancelled']).default('draft'),
  notes: text('notes'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  orderIdIdx: index('order_id_idx').on(table.orderId),
  customerIdIdx: index('customer_id_idx').on(table.customerId),
  orderDateIdx: index('order_date_idx').on(table.orderDate),
}));

export const salesOrderLines = mysqlTable('sales_order_lines', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull(),
  productId: int('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  orderIdIdx: index('order_id_idx').on(table.orderId),
  productIdIdx: index('product_id_idx').on(table.productId),
}));

export const salesAnalytics = mysqlTable('sales_analytics', {
  id: int('id').primaryKey().autoincrement(),
  date: datetime('date').notNull(),
  totalSales: decimal('total_sales', { precision: 15, scale: 2 }).notNull(),
  orderCount: int('order_count').notNull(),
  averageOrderValue: decimal('average_order_value', { precision: 12, scale: 2 }).notNull(),
  topProductId: int('top_product_id'),
  topProductName: varchar('top_product_name', { length: 255 }),
  topProductSales: decimal('top_product_sales', { precision: 12, scale: 2 }),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
}));

// ============================================================================
// جداول المشتريات (Purchase Tables)
// ============================================================================

export const purchaseOrders = mysqlTable('purchase_orders', {
  id: int('id').primaryKey().autoincrement(),
  poId: varchar('po_id', { length: 50 }).unique().notNull(),
  supplierId: int('supplier_id'),
  supplierName: varchar('supplier_name', { length: 255 }).notNull(),
  poDate: datetime('po_date').notNull(),
  expectedDeliveryDate: datetime('expected_delivery_date'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum('status', ['draft', 'confirmed', 'received', 'invoiced', 'cancelled']).default('draft'),
  notes: text('notes'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  poIdIdx: index('po_id_idx').on(table.poId),
  supplierIdIdx: index('supplier_id_idx').on(table.supplierId),
  poDateIdx: index('po_date_idx').on(table.poDate),
}));

export const purchaseOrderLines = mysqlTable('purchase_order_lines', {
  id: int('id').primaryKey().autoincrement(),
  poId: int('po_id').notNull(),
  productId: int('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  lineTotal: decimal('line_total', { precision: 15, scale: 2 }).notNull(),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  poIdIdx: index('po_id_idx').on(table.poId),
  productIdIdx: index('product_id_idx').on(table.productId),
}));

export const purchaseAnalytics = mysqlTable('purchase_analytics', {
  id: int('id').primaryKey().autoincrement(),
  date: datetime('date').notNull(),
  totalPurchases: decimal('total_purchases', { precision: 15, scale: 2 }).notNull(),
  poCount: int('po_count').notNull(),
  averagePOValue: decimal('average_po_value', { precision: 12, scale: 2 }).notNull(),
  topSupplierId: int('top_supplier_id'),
  topSupplierName: varchar('top_supplier_name', { length: 255 }),
  topSupplierPurchases: decimal('top_supplier_purchases', { precision: 12, scale: 2 }),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
}));

// ============================================================================
// جداول المخزون (Inventory Tables)
// ============================================================================

export const inventoryItems = mysqlTable('inventory_items', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').unique().notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  warehouseId: int('warehouse_id').notNull(),
  warehouseName: varchar('warehouse_name', { length: 255 }).notNull(),
  quantityOnHand: decimal('quantity_on_hand', { precision: 10, scale: 2 }).notNull().default('0'),
  quantityReserved: decimal('quantity_reserved', { precision: 10, scale: 2 }).notNull().default('0'),
  quantityAvailable: decimal('quantity_available', { precision: 10, scale: 2 }).notNull().default('0'),
  reorderLevel: decimal('reorder_level', { precision: 10, scale: 2 }).default('0'),
  lastStockCheckDate: datetime('last_stock_check_date'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  productIdIdx: index('product_id_idx').on(table.productId),
  warehouseIdIdx: index('warehouse_id_idx').on(table.warehouseId),
}));

export const inventoryMovements = mysqlTable('inventory_movements', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  warehouseId: int('warehouse_id').notNull(),
  movementType: mysqlEnum('movement_type', ['in', 'out', 'adjustment', 'transfer']).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  referenceId: varchar('reference_id', { length: 50 }),
  referenceType: varchar('reference_type', { length: 50 }),
  notes: text('notes'),
  movementDate: datetime('movement_date').notNull(),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  productIdIdx: index('product_id_idx').on(table.productId),
  warehouseIdIdx: index('warehouse_id_idx').on(table.warehouseId),
  movementDateIdx: index('movement_date_idx').on(table.movementDate),
}));

export const warehouseLocations = mysqlTable('warehouse_locations', {
  id: int('id').primaryKey().autoincrement(),
  warehouseId: int('warehouse_id').unique().notNull(),
  warehouseName: varchar('warehouse_name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  capacity: decimal('capacity', { precision: 12, scale: 2 }),
  currentLoad: decimal('current_load', { precision: 12, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
});

// ============================================================================
// جداول العملاء والموردين (Customers & Suppliers Tables)
// ============================================================================

export const customers = mysqlTable('customers', {
  id: int('id').primaryKey().autoincrement(),
  customerId: varchar('customer_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  customerType: mysqlEnum('customer_type', ['individual', 'business']).default('individual'),
  totalPurchases: decimal('total_purchases', { precision: 15, scale: 2 }).default('0'),
  lastPurchaseDate: datetime('last_purchase_date'),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  customerIdIdx: uniqueIndex('customer_id_idx').on(table.customerId),
  nameIdx: index('name_idx').on(table.name),
  emailIdx: index('email_idx').on(table.email),
}));

export const suppliers = mysqlTable('suppliers', {
  id: int('id').primaryKey().autoincrement(),
  supplierId: varchar('supplier_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  totalPurchases: decimal('total_purchases', { precision: 15, scale: 2 }).default('0'),
  lastPurchaseDate: datetime('last_purchase_date'),
  paymentTerms: varchar('payment_terms', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  supplierIdIdx: uniqueIndex('supplier_id_idx').on(table.supplierId),
  nameIdx: index('name_idx').on(table.name),
  emailIdx: index('email_idx').on(table.email),
}));

export const customerAnalytics = mysqlTable('customer_analytics', {
  id: int('id').primaryKey().autoincrement(),
  date: datetime('date').notNull(),
  totalCustomers: int('total_customers').notNull(),
  activeCustomers: int('active_customers').notNull(),
  newCustomers: int('new_customers').notNull(),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).notNull(),
  averageOrderValue: decimal('average_order_value', { precision: 12, scale: 2 }).notNull(),
  topCustomerId: int('top_customer_id'),
  topCustomerName: varchar('top_customer_name', { length: 255 }),
  topCustomerRevenue: decimal('top_customer_revenue', { precision: 12, scale: 2 }),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
}));

// ============================================================================
// جداول المنتجات (Products Tables)
// ============================================================================

export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  productId: varchar('product_id', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull(),
  margin: decimal('margin', { precision: 5, scale: 2 }).default('0'),
  sku: varchar('sku', { length: 50 }).unique(),
  barcode: varchar('barcode', { length: 50 }),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  productIdIdx: uniqueIndex('product_id_idx').on(table.productId),
  nameIdx: index('name_idx').on(table.name),
  categoryIdx: index('category_idx').on(table.category),
  skuIdx: index('sku_idx').on(table.sku),
}));

export const productAnalytics = mysqlTable('product_analytics', {
  id: int('id').primaryKey().autoincrement(),
  date: datetime('date').notNull(),
  productId: int('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  unitsSold: int('units_sold').notNull().default('0'),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).notNull().default('0'),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }).notNull().default('0'),
  totalProfit: decimal('total_profit', { precision: 15, scale: 2 }).notNull().default('0'),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
  productIdIdx: index('product_id_idx').on(table.productId),
}));

// ============================================================================
// جداول المحاسبة (Accounting Tables)
// ============================================================================

export const financialTransactions = mysqlTable('financial_transactions', {
  id: int('id').primaryKey().autoincrement(),
  transactionId: varchar('transaction_id', { length: 50 }).unique().notNull(),
  transactionType: mysqlEnum('transaction_type', ['sale', 'purchase', 'payment', 'receipt', 'adjustment']).notNull(),
  accountId: varchar('account_id', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  description: text('description'),
  referenceId: varchar('reference_id', { length: 50 }),
  transactionDate: datetime('transaction_date').notNull(),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  transactionIdIdx: uniqueIndex('transaction_id_idx').on(table.transactionId),
  accountIdIdx: index('account_id_idx').on(table.accountId),
  transactionDateIdx: index('transaction_date_idx').on(table.transactionDate),
}));

export const accounts = mysqlTable('accounts', {
  id: int('id').primaryKey().autoincrement(),
  accountId: varchar('account_id', { length: 50 }).unique().notNull(),
  accountName: varchar('account_name', { length: 255 }).notNull(),
  accountType: mysqlEnum('account_type', ['asset', 'liability', 'equity', 'revenue', 'expense']).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0'),
  currency: varchar('currency', { length: 3 }).default('SAR'),
  isActive: boolean('is_active').default(true),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  accountIdIdx: uniqueIndex('account_id_idx').on(table.accountId),
  accountTypeIdx: index('account_type_idx').on(table.accountType),
}));

export const financialReports = mysqlTable('financial_reports', {
  id: int('id').primaryKey().autoincrement(),
  reportDate: datetime('report_date').notNull(),
  reportType: mysqlEnum('report_type', ['income_statement', 'balance_sheet', 'cash_flow', 'trial_balance']).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).default('0'),
  totalExpenses: decimal('total_expenses', { precision: 15, scale: 2 }).default('0'),
  netProfit: decimal('net_profit', { precision: 15, scale: 2 }).default('0'),
  totalAssets: decimal('total_assets', { precision: 15, scale: 2 }).default('0'),
  totalLiabilities: decimal('total_liabilities', { precision: 15, scale: 2 }).default('0'),
  totalEquity: decimal('total_equity', { precision: 15, scale: 2 }).default('0'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  reportDateIdx: index('report_date_idx').on(table.reportDate),
  reportTypeIdx: index('report_type_idx').on(table.reportType),
}));

// ============================================================================
// جداول الفواتير والدفعات (Invoices & Payments Tables)
// ============================================================================

export const invoices = mysqlTable('invoices', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: varchar('invoice_id', { length: 50 }).unique().notNull(),
  customerId: int('customer_id').notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  invoiceDate: datetime('invoice_date').notNull(),
  dueDate: datetime('due_date'),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 15, scale: 2 }).default('0'),
  status: mysqlEnum('status', ['draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled']).default('draft'),
  notes: text('notes'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  invoiceIdIdx: uniqueIndex('invoice_id_idx').on(table.invoiceId),
  customerIdIdx: index('customer_id_idx').on(table.customerId),
  invoiceDateIdx: index('invoice_date_idx').on(table.invoiceDate),
}));

export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),
  paymentId: varchar('payment_id', { length: 50 }).unique().notNull(),
  invoiceId: int('invoice_id').notNull(),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum('payment_method', ['cash', 'check', 'bank_transfer', 'credit_card', 'other']).notNull(),
  paymentDate: datetime('payment_date').notNull(),
  referenceNumber: varchar('reference_number', { length: 50 }),
  notes: text('notes'),
  createdAt: datetime('created_at').defaultNow(),
}, (table) => ({
  paymentIdIdx: uniqueIndex('payment_id_idx').on(table.paymentId),
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  paymentDateIdx: index('payment_date_idx').on(table.paymentDate),
}));

// ============================================================================
// جداول المستخدمين (Users Tables)
// ============================================================================

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }),
  role: mysqlEnum('role', ['admin', 'manager', 'user', 'viewer']).default('user'),
  isActive: boolean('is_active').default(true),
  lastLogin: datetime('last_login'),
  createdAt: datetime('created_at').defaultNow(),
  updatedAt: datetime('updated_at').defaultNow().onUpdateNow(),
}, (table) => ({
  usernameIdx: uniqueIndex('username_idx').on(table.username),
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
