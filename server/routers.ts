import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import {
  authenticateOperator,
  isOperatorLoginConfigured,
} from "./_core/session";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import { engagementRouter } from "./routers/engagements";
import { aetherReconRouter } from "./routers/modules";
import { networkRouter } from "./routers/network";
import { harvestRouter } from "./routers/harvest";
import { payloadRouter } from "./routers/payload";
import { exfilRouter } from "./routers/exfil";
import { aiRouter } from "./routers/ai";
import { specterRouter } from "./routers/specter";
import { nexusRouter } from "./routers/nexus";
import { ghostRouter } from "./routers/ghost";
import { lootRouter } from "./routers/loot";
import { cloudRouter } from "./routers/cloud";
import { socialRouter } from "./routers/social";
import { advancedRouter } from "./routers/advanced";
import { panicRouter } from "./routers/panic";
import { osintRouter } from "./routers/osint";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    loginStatus: publicProcedure.query(() => ({
      configured: isOperatorLoginConfigured(),
    })),
    login: publicProcedure
      .input(
        z.object({
          operatorKey: z.string().min(1, "operator key is required"),
        }),
      )
      .mutation(async ({ input, ctx }) =>
        authenticateOperator(input.operatorKey, ctx.res),
      ),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  engagements: engagementRouter,
  aether: aetherReconRouter,
  specter: specterRouter,
  nexus: nexusRouter,
  ghost: ghostRouter,
  shadow: exfilRouter,
  loot: lootRouter,
  network: networkRouter,
  harvest: harvestRouter,
  payload: payloadRouter,
  exfil: exfilRouter,
  ai: aiRouter,
  cloud: cloudRouter,
  social: socialRouter,
  advanced: advancedRouter,
  panic: panicRouter,
  osint: osintRouter,
});

export type AppRouter = typeof appRouter;
