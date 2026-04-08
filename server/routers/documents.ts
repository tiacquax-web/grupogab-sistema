import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { documents } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const documentsRouter = router({
  list: protectedProcedure.input(z.object({ relatedType: z.string().optional(), relatedId: z.number().optional(), search: z.string().optional() }).optional()).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    let rows = await db.select().from(documents).orderBy(desc(documents.createdAt)).limit(200);
    if (input?.relatedType) rows = rows.filter(r => r.relatedType === input.relatedType);
    if (input?.relatedId) rows = rows.filter(r => r.relatedId === input.relatedId);
    if (input?.search) { const s = input.search.toLowerCase(); rows = rows.filter(r => r.name.toLowerCase().includes(s)); }
    return rows;
  }),
  upload: protectedProcedure.input(z.object({ name: z.string(), mimeType: z.string(), fileBase64: z.string(), fileSize: z.number().optional(), category: z.string().optional(), relatedType: z.enum(["cliente","projeto","ordem_compra","conta_pagar","conta_receber","geral"]).default("geral"), relatedId: z.number().optional(), relatedName: z.string().optional(), description: z.string().optional() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const buffer = Buffer.from(input.fileBase64, "base64");
    const key = `documents/${ctx.user.id}/${nanoid()}-${input.name}`;
    const { url } = await storagePut(key, buffer, input.mimeType);
    await db.insert(documents).values({ name: input.name, description: input.description ?? null, fileUrl: url, fileKey: key, mimeType: input.mimeType, fileSize: input.fileSize ?? null, category: input.category ?? null, relatedType: input.relatedType, relatedId: input.relatedId ?? null, relatedName: input.relatedName ?? null, uploadedById: ctx.user.id, uploadedByName: ctx.user.name ?? null });
    return { success: true, url };
  }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(documents).where(eq(documents.id, input.id));
    return { success: true };
  }),
});
