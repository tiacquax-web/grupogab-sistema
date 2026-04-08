import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users, activityLogs, userPermissions } from "../../drizzle/schema";
import { eq, desc, and, like, or, gte, lte, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Middleware that ensures only admins can call these procedures
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ─── SYSTEM STATS ────────────────────────────────────────────────────────────
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalUsers: 0, activeUsers: 0, adminUsers: 0, totalLogs: 0, recentActions: 0 };

    const allUsers = await db.select().from(users);
    const totalLogs = await db.select({ c: count() }).from(activityLogs);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await db.select({ c: count() }).from(activityLogs).where(gte(activityLogs.createdAt, oneDayAgo));

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.role !== "admin").length,
      adminUsers: allUsers.filter(u => u.role === "admin").length,
      totalLogs: totalLogs[0]?.c ?? 0,
      recentActions: recentLogs[0]?.c ?? 0,
    };
  }),

  // ─── USER MANAGEMENT ─────────────────────────────────────────────────────────
  listUsers: adminProcedure
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(users).orderBy(desc(users.createdAt));
      if (input?.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(u =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s) ||
          u.openId?.toLowerCase().includes(s)
        );
      }
      return rows;
    }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode alterar sua própria role." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));

      // Log the action
      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Admin",
        userEmail: ctx.user.email ?? "",
        action: "UPDATE_USER_ROLE",
        module: "admin",
        description: `Role do usuário ID ${input.userId} alterada para ${input.role}`,
        entityType: "user",
        entityId: input.userId,
        status: "success",
      });

      return { success: true };
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Você não pode excluir sua própria conta." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(users).where(eq(users.id, input.userId));

      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Admin",
        userEmail: ctx.user.email ?? "",
        action: "DELETE_USER",
        module: "admin",
        description: `Usuário ID ${input.userId} removido do sistema`,
        entityType: "user",
        entityId: input.userId,
        status: "warning",
      });

      return { success: true };
    }),

  // ─── PERMISSIONS ─────────────────────────────────────────────────────────────
  getPermissions: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(userPermissions).where(eq(userPermissions.userId, input.userId));
    }),

  setPermission: adminProcedure
    .input(z.object({
      userId: z.number(),
      module: z.string(),
      canView: z.boolean(),
      canCreate: z.boolean(),
      canEdit: z.boolean(),
      canDelete: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const existing = await db.select().from(userPermissions)
        .where(and(eq(userPermissions.userId, input.userId), eq(userPermissions.module, input.module)))
        .limit(1);

      const permData = {
        userId: input.userId,
        module: input.module,
        canView: input.canView ? 1 : 0,
        canCreate: input.canCreate ? 1 : 0,
        canEdit: input.canEdit ? 1 : 0,
        canDelete: input.canDelete ? 1 : 0,
      };

      if (existing.length > 0) {
        await db.update(userPermissions).set(permData).where(eq(userPermissions.id, existing[0].id));
      } else {
        await db.insert(userPermissions).values(permData);
      }

      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Admin",
        userEmail: ctx.user.email ?? "",
        action: "UPDATE_PERMISSIONS",
        module: "admin",
        description: `Permissões do módulo "${input.module}" atualizadas para usuário ID ${input.userId}`,
        entityType: "user",
        entityId: input.userId,
        status: "success",
      });

      return { success: true };
    }),

  // ─── ACTIVITY LOGS ───────────────────────────────────────────────────────────
  listLogs: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      search: z.string().optional(),
      module: z.string().optional(),
      status: z.enum(["success", "error", "warning", "all"]).optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logs: [], total: 0 };

      let rows = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(500);

      if (input?.module && input.module !== "all") {
        rows = rows.filter(r => r.module === input.module);
      }
      if (input?.status && input.status !== "all") {
        rows = rows.filter(r => r.status === input.status);
      }
      if (input?.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r =>
          r.description?.toLowerCase().includes(s) ||
          r.userName?.toLowerCase().includes(s) ||
          r.action?.toLowerCase().includes(s)
        );
      }
      if (input?.dateFrom) {
        const from = new Date(input.dateFrom);
        rows = rows.filter(r => new Date(r.createdAt) >= from);
      }
      if (input?.dateTo) {
        const to = new Date(input.dateTo + "T23:59:59");
        rows = rows.filter(r => new Date(r.createdAt) <= to);
      }

      const total = rows.length;
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 50;
      const paginated = rows.slice((page - 1) * limit, page * limit);

      return { logs: paginated, total };
    }),

  // ─── LOG WRITER (called from other routers) ──────────────────────────────────
  writeLog: protectedProcedure
    .input(z.object({
      action: z.string(),
      module: z.string(),
      description: z.string().optional(),
      entityType: z.string().optional(),
      entityId: z.number().optional(),
      status: z.enum(["success", "error", "warning"]).default("success"),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(activityLogs).values({
        userId: ctx.user.id,
        userName: ctx.user.name ?? "Usuário",
        userEmail: ctx.user.email ?? "",
        action: input.action,
        module: input.module,
        description: input.description,
        entityType: input.entityType,
        entityId: input.entityId,
        status: input.status,
        metadata: input.metadata,
      });
      return { success: true };
    }),

  // ─── LOG STATS ───────────────────────────────────────────────────────────────
  logStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { byModule: [], byStatus: [], byDay: [] };

    const logs = await db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(1000);

    // Group by module
    const moduleMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};

    logs.forEach(log => {
      moduleMap[log.module] = (moduleMap[log.module] || 0) + 1;
      statusMap[log.status] = (statusMap[log.status] || 0) + 1;
      const day = new Date(log.createdAt).toLocaleDateString("pt-BR");
      dayMap[day] = (dayMap[day] || 0) + 1;
    });

    return {
      byModule: Object.entries(moduleMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
      byStatus: Object.entries(statusMap).map(([name, count]) => ({ name, count })),
      byDay: Object.entries(dayMap).slice(0, 7).map(([date, count]) => ({ date, count })).reverse(),
    };
  }),
});
