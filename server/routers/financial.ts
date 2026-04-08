import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { accountsPayable, accountsReceivable } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { storagePut } from "../storage";

const payableInput = z.object({
  description: z.string().min(1),
  supplierName: z.string().optional(),
  amount: z.string(),
  dueDate: z.string(), // "YYYY-MM-DD"
  status: z.enum(["a_pagar", "em_aberto", "pago", "cancelado"]).default("a_pagar"),
  category: z.string().optional(),
  costCenterId: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["diario", "semanal", "mensal", "anual"]).optional(),
  recurrenceEndDate: z.string().optional(),
  isInstallment: z.boolean().default(false),
  totalInstallments: z.number().optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
  attachmentKey: z.string().optional(),
});

const receivableInput = z.object({
  description: z.string().min(1),
  clientName: z.string().optional(),
  clientId: z.number().optional(),
  amount: z.string(),
  dueDate: z.string(),
  status: z.enum(["a_receber", "em_aberto", "recebido", "cancelado"]).default("a_receber"),
  category: z.string().optional(),
  costCenterId: z.number().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["diario", "semanal", "mensal", "anual"]).optional(),
  isInstallment: z.boolean().default(false),
  totalInstallments: z.number().optional(),
  notes: z.string().optional(),
});

export const financialRouter = router({
  // ── PAYABLE ──────────────────────────────────────────────────────────────────
  listPayable: protectedProcedure
    .input(z.object({
      status: z.enum(["a_pagar", "em_aberto", "pago", "cancelado", "all"]).default("all"),
      search: z.string().optional(),
      costCenterId: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conds: any[] = [];
      if (input?.status && input.status !== "all") conds.push(eq(accountsPayable.status, input.status));
      if (input?.costCenterId) conds.push(eq(accountsPayable.costCenterId, input.costCenterId));
      let rows = await db.select().from(accountsPayable)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(accountsPayable.dueDate)).limit(200);
      if (input?.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r => r.description.toLowerCase().includes(s) || r.supplierName?.toLowerCase().includes(s));
      }
      return rows;
    }),

  createPayable: protectedProcedure.input(payableInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");

    if (input.isInstallment && (input.totalInstallments ?? 0) > 1) {
      const groupId = nanoid();
      const baseDate = new Date(input.dueDate + "T12:00:00");
      const entries: any[] = [];
      for (let i = 0; i < input.totalInstallments!; i++) {
        const d = new Date(baseDate);
        d.setMonth(d.getMonth() + i);
        const dateStr = d.toISOString().split("T")[0];
        entries.push({
          description: `${input.description} (${i + 1}/${input.totalInstallments})`,
          supplierName: input.supplierName ?? null,
          amount: input.amount,
          dueDate: dateStr,
          status: "a_pagar" as const,
          category: input.category ?? null,
          costCenterId: input.costCenterId ?? null,
          isRecurring: false,
          isInstallment: true,
          installmentNumber: i + 1,
          totalInstallments: input.totalInstallments,
          installmentGroupId: groupId,
          notes: input.notes ?? null,
          createdById: ctx.user.id,
        });
      }
      await db.insert(accountsPayable).values(entries);
      return { success: true, installments: input.totalInstallments };
    }

    await db.insert(accountsPayable).values({
      description: input.description,
      supplierName: input.supplierName ?? null,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      category: input.category ?? null,
      costCenterId: input.costCenterId ?? null,
      isRecurring: input.isRecurring,
      recurrenceType: input.recurrenceType ?? null,
      recurrenceEndDate: input.recurrenceEndDate ?? null,
      isInstallment: false,
      notes: input.notes ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
      attachmentKey: input.attachmentKey ?? null,
      createdById: ctx.user.id,
    } as any);
    return { success: true };
  }),

  updatePayable: protectedProcedure
    .input(z.object({ id: z.number(), data: payableInput.partial() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(accountsPayable).set(input.data as any).where(eq(accountsPayable.id, input.id));
      return { success: true };
    }),

  markAsPaid: protectedProcedure
    .input(z.object({ id: z.number(), paidDate: z.string(), paidAmount: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(accountsPayable).set({ status: "pago", paidDate: input.paidDate, paidAmount: input.paidAmount } as any)
        .where(eq(accountsPayable.id, input.id));
      return { success: true };
    }),

  deletePayable: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(accountsPayable).where(eq(accountsPayable.id, input.id));
    return { success: true };
  }),

  summaryPayable: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { aPagar: 0, emAberto: 0, pago: 0 };
    const rows = await db.select().from(accountsPayable);
    const sum = (s: string) => rows.filter(r => r.status === s).reduce((acc, r) => acc + parseFloat(r.amount as string || "0"), 0);
    return { aPagar: sum("a_pagar"), emAberto: sum("em_aberto"), pago: sum("pago") };
  }),

  // ── RECEIVABLE ───────────────────────────────────────────────────────────────
  listReceivable: protectedProcedure
    .input(z.object({
      status: z.enum(["a_receber", "em_aberto", "recebido", "cancelado", "all"]).default("all"),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conds: any[] = [];
      if (input?.status && input.status !== "all") conds.push(eq(accountsReceivable.status, input.status));
      let rows = await db.select().from(accountsReceivable)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(accountsReceivable.dueDate)).limit(200);
      if (input?.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r => r.description.toLowerCase().includes(s) || r.clientName?.toLowerCase().includes(s));
      }
      return rows;
    }),

  createReceivable: protectedProcedure.input(receivableInput).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(accountsReceivable).values({
      description: input.description,
      clientName: input.clientName ?? null,
      clientId: input.clientId ?? null,
      amount: input.amount,
      dueDate: input.dueDate,
      status: input.status,
      category: input.category ?? null,
      costCenterId: input.costCenterId ?? null,
      isRecurring: input.isRecurring,
      recurrenceType: input.recurrenceType ?? null,
      isInstallment: input.isInstallment,
      totalInstallments: input.totalInstallments ?? null,
      notes: input.notes ?? null,
      createdById: ctx.user.id,
    } as any);
    return { success: true };
  }),

  markAsReceived: protectedProcedure
    .input(z.object({ id: z.number(), receivedDate: z.string(), receivedAmount: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(accountsReceivable).set({ status: "recebido", receivedDate: input.receivedDate, receivedAmount: input.receivedAmount } as any)
        .where(eq(accountsReceivable.id, input.id));
      return { success: true };
    }),

  deleteReceivable: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(accountsReceivable).where(eq(accountsReceivable.id, input.id));
    return { success: true };
  }),

  summaryReceivable: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { aReceber: 0, emAberto: 0, recebido: 0 };
    const rows = await db.select().from(accountsReceivable);
    const sum = (s: string) => rows.filter(r => r.status === s).reduce((acc, r) => acc + parseFloat(r.amount as string || "0"), 0);
    return { aReceber: sum("a_receber"), emAberto: sum("em_aberto"), recebido: sum("recebido") };
  }),

  // ── UPDATE RECEIVABLE ────────────────────────────────────────────────────────
  updateReceivable: protectedProcedure
    .input(z.object({ id: z.number(), data: receivableInput.partial() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(accountsReceivable).set(input.data as any).where(eq(accountsReceivable.id, input.id));
      return { success: true };
    }),

  // ── FILE UPLOAD ──────────────────────────────────────────────────────────────
  uploadAttachment: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      fileBase64: z.string(), // base64 encoded file content
      entityType: z.enum(["payable", "receivable"]),
      entityId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const ext = input.fileName.split(".").pop() ?? "bin";
      const key = `grupogab/attachments/${ctx.user.id}/${nanoid()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.fileType);

      // If entityId provided, update the record
      if (input.entityId) {
        const db = await getDb();
        if (db) {
          if (input.entityType === "payable") {
            await db.update(accountsPayable).set({ attachmentUrl: url, attachmentKey: key } as any).where(eq(accountsPayable.id, input.entityId));
          } else {
            await db.update(accountsReceivable).set({ attachmentUrl: url, attachmentKey: key } as any).where(eq(accountsReceivable.id, input.entityId));
          }
        }
      }

      return { url, key };
    }),

  // ── CSV IMPORT ───────────────────────────────────────────────────────────────
  importPayableCsv: protectedProcedure
    .input(z.object({
      rows: z.array(z.object({
        description: z.string(),
        supplierName: z.string().optional(),
        amount: z.string(),
        dueDate: z.string(),
        category: z.string().optional(),
        notes: z.string().optional(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const entries = input.rows.map(r => ({
        description: r.description,
        supplierName: r.supplierName ?? null,
        amount: r.amount,
        dueDate: r.dueDate,
        status: "a_pagar" as const,
        category: r.category ?? null,
        notes: r.notes ?? null,
        isRecurring: false,
        isInstallment: false,
        createdById: ctx.user.id,
      }));
      await db.insert(accountsPayable).values(entries as any);
      return { success: true, imported: entries.length };
    }),

  importReceivableCsv: protectedProcedure
    .input(z.object({
      rows: z.array(z.object({
        description: z.string(),
        clientName: z.string().optional(),
        amount: z.string(),
        dueDate: z.string(),
        category: z.string().optional(),
        notes: z.string().optional(),
      }))
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const entries = input.rows.map(r => ({
        description: r.description,
        clientName: r.clientName ?? null,
        amount: r.amount,
        dueDate: r.dueDate,
        status: "a_receber" as const,
        category: r.category ?? null,
        notes: r.notes ?? null,
        isRecurring: false,
        isInstallment: false,
        createdById: ctx.user.id,
      }));
      await db.insert(accountsReceivable).values(entries as any);
      return { success: true, imported: entries.length };
    }),
});
