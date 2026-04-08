import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { crmLeads, crmActivities } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const crmRouter = router({
  listLeads: protectedProcedure.input(z.object({ stage: z.string().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let rows = await db.select().from(crmLeads).orderBy(desc(crmLeads.createdAt)).limit(500);
    if (input?.stage && input.stage !== "all") rows = rows.filter(r => r.stage === input.stage);
    if (input?.search) { const s = input.search.toLowerCase(); rows = rows.filter(r => r.name.toLowerCase().includes(s) || r.company?.toLowerCase().includes(s)); }
    return rows;
  }),
  createLead: protectedProcedure
    .input(z.object({ name: z.string().min(1), email: z.string().optional(), phone: z.string().optional(), company: z.string().optional(), stage: z.enum(["novo","primeira_tentativa","segunda_tentativa","terceira_tentativa","proposta","negociacao","fechado_ganho","fechado_perdido"]).default("novo"), value: z.string().optional(), source: z.string().optional(), assignedToName: z.string().optional(), nextFollowUp: z.string().optional(), notes: z.string().optional(), priority: z.enum(["baixa","media","alta"]).default("media") }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(crmLeads).values({ ...input, value: input.value ?? null, nextFollowUp: input.nextFollowUp ? new Date(input.nextFollowUp) : null, createdById: ctx.user.id } as any);
      return { success: true };
    }),
  updateLeadStage: protectedProcedure.input(z.object({ id: z.number(), stage: z.enum(["novo","primeira_tentativa","segunda_tentativa","terceira_tentativa","proposta","negociacao","fechado_ganho","fechado_perdido"]) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(crmLeads).set({ stage: input.stage }).where(eq(crmLeads.id, input.id));
    return { success: true };
  }),
  deleteLead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(crmLeads).where(eq(crmLeads.id, input.id));
    return { success: true };
  }),
  addActivity: protectedProcedure.input(z.object({ leadId: z.number(), type: z.enum(["ligacao","email","reuniao","visita","whatsapp","outro"]), description: z.string().optional(), outcome: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(crmActivities).values({ ...input, completedAt: new Date(), createdById: ctx.user.id });
    return { success: true };
  }),
  listActivities: protectedProcedure.input(z.object({ leadId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(crmActivities).where(eq(crmActivities.leadId, input.leadId)).orderBy(desc(crmActivities.createdAt));
  }),
});
