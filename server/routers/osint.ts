import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { osintNexusFindings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { OSINTNexus } from "../_core/osint";
import { taskQueue } from "../_core/queue";

export const osintRouter = router({
  startNexusScan: protectedProcedure
    .input(z.object({ engagementId: z.number(), target: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Trigger background task via BullMQ
      await taskQueue.add("osint-nexus-scan", {
        engagementId: input.engagementId,
        target: input.target,
      });

      return { success: true };
    }),
  getFindings: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(osintNexusFindings)
        .where(eq(osintNexusFindings.engagementId, input.engagementId));
    }),
});
