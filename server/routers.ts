import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDashboardStats, getTopProducts, getTopCustomers, getRecentOrders, getLowInventoryProducts } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  // Analytics routers
  analytics: router({
    dashboard: publicProcedure.query(async () => {
      const stats = await getDashboardStats();
      return stats || {
        totalProducts: 0,
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalInventoryValue: 0,
      };
    }),
    topProducts: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ input }) => {
      return await getTopProducts(input.limit);
    }),
    topCustomers: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ input }) => {
      return await getTopCustomers(input.limit);
    }),
    recentOrders: publicProcedure.input(z.object({ limit: z.number().default(10) })).query(async ({ input }) => {
      return await getRecentOrders(input.limit);
    }),
    lowInventory: publicProcedure.input(z.object({ threshold: z.number().default(100) })).query(async ({ input }) => {
      return await getLowInventoryProducts(input.threshold);
    }),
  }),
});

export type AppRouter = typeof appRouter;
