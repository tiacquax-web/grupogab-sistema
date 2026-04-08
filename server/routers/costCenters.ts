import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { costCenters } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const costCentersRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(costCenters).orderBy(desc(costCenters.createdAt));
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), code: z.string().optional(), type: z.enum(["obra","servico","administrativo","outro"]).default("outro"), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.insert(costCenters).values({ ...input, createdById: ctx.user.id });
      return { success: true };
    }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.delete(costCenters).where(eq(costCenters.id, input.id));
    return { success: true };
  }),
});
