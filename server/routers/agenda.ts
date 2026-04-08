import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agendaEvents } from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const agendaRouter = router({
  list: protectedProcedure.input(z.object({ startDate: z.string().optional(), endDate: z.string().optional(), userId: z.number().optional() }).optional()).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const userId = input?.userId ?? ctx.user.id;
    const conditions = [eq(agendaEvents.userId, userId)];
    if (input?.startDate) conditions.push(gte(agendaEvents.startAt, new Date(input.startDate)));
    if (input?.endDate) conditions.push(lte(agendaEvents.startAt, new Date(input.endDate)));
    return db.select().from(agendaEvents).where(and(...conditions)).orderBy(agendaEvents.startAt);
  }),
  create: protectedProcedure.input(z.object({ title: z.string().min(1), description: z.string().optional(), location: z.string().optional(), startAt: z.string(), endAt: z.string().optional(), allDay: z.boolean().default(false), type: z.enum(["reuniao","visita","ligacao","prazo","outro"]).default("outro") })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(agendaEvents).values({ title: input.title, description: input.description ?? null, location: input.location ?? null, startAt: new Date(input.startAt), endAt: input.endAt ? new Date(input.endAt) : null, allDay: input.allDay, type: input.type, userId: ctx.user.id });
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), data: z.object({ title: z.string().optional(), status: z.enum(["agendado","realizado","cancelado"]).optional(), description: z.string().optional() }) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(agendaEvents).set(input.data).where(eq(agendaEvents.id, input.id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(agendaEvents).where(eq(agendaEvents.id, input.id));
    return { success: true };
  }),
});
