import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clients } from "../../drizzle/schema";
import { eq, desc, like, or } from "drizzle-orm";

export const clientsRouter = router({
  importCsv: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const lines = input.csvContent.trim().split("\n");
      if (lines.length < 2) return { imported: 0 };
      const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v: string) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h: string, idx: number) => { row[h] = values[idx] || ""; });
        const name = row["nome"] || row["name"];
        if (!name) continue;
        try {
          await db.insert(clients).values({
            name,
            type: (row["tipo"] === "pessoa_juridica" ? "pessoa_juridica" : "pessoa_fisica") as "pessoa_fisica" | "pessoa_juridica",
            email: row["email"] || undefined,
            phone: row["telefone"] || row["phone"] || undefined,
            cpfCnpj: row["documento"] || row["cpf"] || row["cnpj"] || undefined,
            city: row["cidade"] || row["city"] || undefined,
            state: row["estado"] || row["state"] || undefined,
            createdById: ctx.user.id,
          });
          imported++;
        } catch {}
      }
      return { imported };
    }),

  list: protectedProcedure
    .input(z.object({ search: z.string().optional(), status: z.enum(["ativo", "inativo", "all"]).optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      let rows = await db.select().from(clients).orderBy(desc(clients.createdAt)).limit(500);
      if (input?.status && input.status !== "all") rows = rows.filter(r => r.status === input.status);
      if (input?.search) {
        const s = input.search.toLowerCase();
        rows = rows.filter(r => r.name.toLowerCase().includes(s) || r.email?.toLowerCase().includes(s) || r.cpfCnpj?.includes(s));
      }
      return rows;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      cpfCnpj: z.string().optional(),
      type: z.enum(["pessoa_fisica", "pessoa_juridica"]).default("pessoa_fisica"),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(clients).values({ ...input, createdById: ctx.user.id });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), status: z.enum(["ativo", "inativo"]).optional(), notes: z.string().optional() }) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.update(clients).set(input.data).where(eq(clients.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(clients).where(eq(clients.id, input.id));
      return { success: true };
    }),
});
