import { eq, desc, asc, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, customers, salesOrders, inventory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Analytics queries
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    const totalProducts = await db.select({ count: sql`COUNT(*)` }).from(products);
    const totalCustomers = await db.select({ count: sql`COUNT(*)` }).from(customers);
    const totalOrders = await db.select({ count: sql`COUNT(*)` }).from(salesOrders);
    const totalRevenue = await db.select({ total: sql`SUM(totalAmount)` }).from(salesOrders).where(eq(salesOrders.status, 'completed'));
    const totalInventoryValue = await db.select({ total: sql`SUM(inventoryValue)` }).from(inventory);

    return {
      totalProducts: totalProducts[0]?.count || 0,
      totalCustomers: totalCustomers[0]?.count || 0,
      totalOrders: totalOrders[0]?.count || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalInventoryValue: totalInventoryValue[0]?.total || 0,
    };
  } catch (error) {
    console.error('[Database] Failed to get dashboard stats:', error);
    return null;
  }
}

export async function getTopProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(products).orderBy(desc(products.salePrice)).limit(limit);
  } catch (error) {
    console.error('[Database] Failed to get top products:', error);
    return [];
  }
}

export async function getTopCustomers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(customers).orderBy(desc(customers.totalPurchases)).limit(limit);
  } catch (error) {
    console.error('[Database] Failed to get top customers:', error);
    return [];
  }
}

export async function getRecentOrders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.orderDate)).limit(limit);
  } catch (error) {
    console.error('[Database] Failed to get recent orders:', error);
    return [];
  }
}

export async function getLowInventoryProducts(threshold: number = 100) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(products).where(lt(products.available, threshold as any)).orderBy(asc(products.available));
  } catch (error) {
    console.error('[Database] Failed to get low inventory products:', error);
    return [];
  }
}
