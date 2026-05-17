import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  networkScans,
  operatorSessionLogs,
  engagements,
} from "../../drizzle/schema";
import { taskQueue } from "../_core/queue";
import { NetworkTopologyEngine } from "../_core/networkTopology";

async function assertEngagementOwnership(engagementId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [engagement] = await db
    .select()
    .from(engagements)
    .where(
      and(eq(engagements.id, engagementId), eq(engagements.userId, userId)),
    )
    .limit(1);
  if (!engagement) throw new Error("Engagement not found or access denied");
  return db;
}

export const networkRouter = router({
  getScans: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(networkScans)
        .where(eq(networkScans.engagementId, input.engagementId));
    }),

  startScan: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        target: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      const [scan] = await db.insert(networkScans).values({
        engagementId: input.engagementId,
        target: input.target,
        status: "queued",
        results: JSON.stringify([]),
      });

      // Enqueue the real scan task
      await taskQueue.add("network-scan", {
        scanId: scan.insertId,
        engagementId: input.engagementId,
        target: input.target,
      });

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "network",
        action: "start_network_scan",
        details: JSON.stringify({
          target: input.target,
          scanId: scan.insertId,
        }),
        status: "success",
      });

      return { success: true, scanId: scan.insertId };
    }),

  getTopology: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      await assertEngagementOwnership(input.engagementId, ctx.user.id);

      // Use the real NetworkTopologyEngine to build the graph
      const topology = await NetworkTopologyEngine.buildTopology(
        input.engagementId,
      );
      const attackVectors =
        NetworkTopologyEngine.suggestAttackVectors(topology);

      return {
        ...topology,
        attackVectors,
      };
    }),
});
