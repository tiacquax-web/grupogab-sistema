import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { financialRouter } from "./routers/financial";
import { clientsRouter } from "./routers/clients";
import { crmRouter } from "./routers/crm";
import { chatRouter } from "./routers/chat";
import { agendaRouter } from "./routers/agenda";
import { projectsRouter } from "./routers/projects";
import { documentsRouter } from "./routers/documents";
import { purchaseOrdersRouter } from "./routers/purchaseOrders";
import { costCentersRouter } from "./routers/costCenters";
import { adminRouter } from "./routers/admin";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  financial: financialRouter,
  clients: clientsRouter,
  crm: crmRouter,
  chat: chatRouter,
  agenda: agendaRouter,
  projects: projectsRouter,
  documents: documentsRouter,
  purchaseOrders: purchaseOrdersRouter,
  costCenters: costCentersRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
