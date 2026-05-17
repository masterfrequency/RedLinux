import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getEngagementsByUserId,
  getEngagementById,
  createEngagement,
  getOperatorSessionLogs,
} from "../db";

export const engagementRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getEngagementsByUserId(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const engagement = await getEngagementById(input.id);
      if (!engagement || engagement.userId !== ctx.user.id) {
        throw new Error("Engagement not found or access denied");
      }
      return engagement;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        target: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const result = await createEngagement({
        userId: ctx.user.id,
        name: input.name,
        target: input.target,
        notes: input.notes,
        status: "active",
      });
      return { success: true };
    }),

  getSessionLogs: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input, ctx }) => {
      const engagement = await getEngagementById(input.engagementId);
      if (!engagement || engagement.userId !== ctx.user.id) {
        throw new Error("Engagement not found or access denied");
      }
      return getOperatorSessionLogs(input.engagementId);
    }),
});
