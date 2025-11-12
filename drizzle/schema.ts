import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  productCode: varchar("productCode", { length: 100 }).notNull().unique(),
  productName: text("productName").notNull(),
  category: varchar("category", { length: 100 }),
  purchasePrice: int("purchasePrice").notNull().default(0), // in fils
  salePrice: int("salePrice").notNull().default(0), // in fils
  profitMargin: int("profitMargin").notNull().default(0), // in percentage * 100
  quantity: int("quantity").notNull().default(0),
  reserved: int("reserved").notNull().default(0),
  available: int("available").notNull().default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Customers table
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  customerId: varchar("customerId", { length: 100 }).notNull().unique(),
  customerName: text("customerName").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  customerType: mysqlEnum("customerType", ["individual", "company"]).default("individual"),
  vipStatus: mysqlEnum("vipStatus", ["regular", "vip"]).default("regular"),
  discount: int("discount").notNull().default(0), // in percentage * 100
  totalPurchases: int("totalPurchases").notNull().default(0), // in fils
  totalValue: int("totalValue").notNull().default(0), // in fils
  lastPurchaseDate: timestamp("lastPurchaseDate"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Sales orders table
export const salesOrders = mysqlTable("salesOrders", {
  id: int("id").autoincrement().primaryKey(),
  orderId: varchar("orderId", { length: 100 }).notNull().unique(),
  customerId: int("customerId").notNull(),
  orderDate: timestamp("orderDate").notNull(),
  totalAmount: int("totalAmount").notNull().default(0), // in fils
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending"),
  itemCount: int("itemCount").notNull().default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = typeof salesOrders.$inferInsert;

// Inventory table
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull().default(0),
  reserved: int("reserved").notNull().default(0),
  available: int("available").notNull().default(0),
  inventoryValue: int("inventoryValue").notNull().default(0), // in fils
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

// Analytics cache table
export const analyticsCache = mysqlTable("analyticsCache", {
  id: int("id").autoincrement().primaryKey(),
  cacheKey: varchar("cacheKey", { length: 255 }).notNull().unique(),
  cacheData: text("cacheData").notNull(), // JSON string
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsCache = typeof analyticsCache.$inferSelect;
export type InsertAnalyticsCache = typeof analyticsCache.$inferInsert;