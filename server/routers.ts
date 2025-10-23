import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createLead, getAllLeads } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  leads: router({
    create: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(1, "Nome completo é obrigatório"),
          email: z.string().email("Email inválido"),
          phone: z.string().min(1, "Telefone é obrigatório"),
          instagram: z.string().min(1, "Instagram é obrigatório"),
        })
      )
      .mutation(async ({ input }) => {
        await createLead(input);
        return { success: true };
      }),
    list: publicProcedure.query(async () => {
      return await getAllLeads();
    }),
  }),
});

export type AppRouter = typeof appRouter;
