import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { purchaseOrders } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const purchaseOrdersRouter = router({
  list: protectedProcedure.input(z.object({ status: z.string().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let rows = await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt)).limit(200);
    if (input?.status && input.status !== "all") rows = rows.filter(r => r.status === input.status);
    if (input?.search) { const s = input.search.toLowerCase(); rows = rows.filter(r => r.orderNumber.toLowerCase().includes(s) || r.supplierName?.toLowerCase().includes(s) || r.responsiblePersonName?.toLowerCase().includes(s)); }
    return rows;
  }),
  create: protectedProcedure.input(z.object({ orderNumber: z.string().min(1), description: z.string().optional(), supplierName: z.string().optional(), responsiblePersonName: z.string().optional(), destinedToName: z.string().optional(), sector: z.string().optional(), costCenterId: z.number().optional(), totalAmount: z.string().optional(), status: z.enum(["rascunho","pendente","aprovado","recebido","cancelado"]).default("pendente"), requestedDate: z.string().optional(), expectedDate: z.string().optional(), notes: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(purchaseOrders).values({ ...input, requestedDate: input.requestedDate ? new Date(input.requestedDate) : null, expectedDate: input.expectedDate ? new Date(input.expectedDate) : null, createdById: ctx.user.id } as any);
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), data: z.object({ status: z.enum(["rascunho","pendente","aprovado","recebido","cancelado"]).optional(), notes: z.string().optional() }) })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(purchaseOrders).set(input.data).where(eq(purchaseOrders.id, input.id));
    return { success: true };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, input.id));
    return { success: true };
  }),
});
