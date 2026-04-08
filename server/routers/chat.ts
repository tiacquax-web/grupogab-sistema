import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { chatConversations, chatMessages, chatParticipants, users } from "../../drizzle/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export const chatRouter = router({
  listUsers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const all = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
    return all.filter(u => u.id !== ctx.user.id);
  }),
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const myParticipations = await db.select().from(chatParticipants).where(eq(chatParticipants.userId, ctx.user.id));
    if (myParticipations.length === 0) return [];
    const convIds = myParticipations.map(p => p.conversationId);
    const convs = await db.select().from(chatConversations).where(inArray(chatConversations.id, convIds)).orderBy(desc(chatConversations.updatedAt));
    return convs;
  }),
  createConversation: protectedProcedure.input(z.object({ name: z.string().optional(), participantIds: z.array(z.number()).min(1), isGroup: z.boolean().default(false) })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    const [conv] = await db.insert(chatConversations).values({ name: input.name ?? null, isGroup: input.isGroup, createdById: ctx.user.id }).$returningId();
    const allParticipants = Array.from(new Set([ctx.user.id, ...input.participantIds]));
    await db.insert(chatParticipants).values(allParticipants.map(uid => ({ conversationId: conv.id, userId: uid })));
    return { id: conv.id };
  }),
  listMessages: protectedProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(chatMessages).where(eq(chatMessages.conversationId, input.conversationId)).orderBy(chatMessages.createdAt).limit(100);
  }),
  sendMessage: protectedProcedure.input(z.object({ conversationId: z.number(), content: z.string().min(1) })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.insert(chatMessages).values({ conversationId: input.conversationId, senderId: ctx.user.id, senderName: ctx.user.name ?? "Usuário", content: input.content });
    await db.update(chatConversations).set({ updatedAt: new Date() }).where(eq(chatConversations.id, input.conversationId));
    return { success: true };
  }),
  getParticipants: protectedProcedure.input(z.object({ conversationId: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const parts = await db.select().from(chatParticipants).where(eq(chatParticipants.conversationId, input.conversationId));
    if (parts.length === 0) return [];
    const userIds = parts.map(p => p.userId);
    return db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, userIds));
  }),
});
