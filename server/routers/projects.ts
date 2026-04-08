import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { projects, projectTasks } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const projectsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }),
  create: protectedProcedure.input(z.object({ name: z.string().min(1), description: z.string().optional(), clientName: z.string().optional(), costCenterId: z.number().optional(), status: z.enum(["planejamento","em_andamento","pausado","concluido","cancelado"]).default("planejamento"), priority: z.enum(["baixa","media","alta","urgente"]).default("media"), startDate: z.string().optional(), endDate: z.string().optional(), budget: z.string().optional(), managerName: z.string().optional(), address: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(projects).values({ ...input, startDate: input.startDate ? new Date(input.startDate) : null, endDate: input.endDate ? new Date(input.endDate) : null, createdById: ctx.user.id } as any);
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), status: z.enum(["planejamento","em_andamento","pausado","concluido","cancelado"]).optional(), priority: z.enum(["baixa","media","alta","urgente"]).optional() }) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(projects).set(input.data).where(eq(projects.id, input.id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(projects).where(eq(projects.id, input.id));
    return { success: true };
  }),
  listTasks: protectedProcedure.input(z.object({ projectId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(projectTasks).where(eq(projectTasks.projectId, input.projectId)).orderBy(projectTasks.position);
  }),
  createTask: protectedProcedure.input(z.object({ projectId: z.number(), title: z.string().min(1), description: z.string().optional(), phase: z.string().optional(), status: z.enum(["backlog","em_andamento","revisao","concluido"]).default("backlog"), priority: z.enum(["baixa","media","alta","urgente"]).default("media"), assignedToName: z.string().optional(), dueDate: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(projectTasks).values({ ...input, dueDate: input.dueDate ? new Date(input.dueDate) : null, createdById: ctx.user.id } as any);
    return { success: true };
  }),
  updateTaskStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["backlog","em_andamento","revisao","concluido"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(projectTasks).set({ status: input.status, completedAt: input.status === "concluido" ? new Date() : null }).where(eq(projectTasks.id, input.id));
    return { success: true };
  }),
  deleteTask: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(projectTasks).where(eq(projectTasks.id, input.id));
    return { success: true };
  }),
});
