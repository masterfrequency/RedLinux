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

/**
 * PhonkAlphabet's Network Infiltrator V2: Stealth Scanning & Topology Analysis
 * Low-and-slow scanning, decoy traffic, and automated lateral movement mapping.
 */

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
        scanType: z
          .enum(["stealth", "aggressive", "discovery"])
          .default("stealth"),
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
        scanType: input.scanType,
        status: "queued",
        results: JSON.stringify([]),
      });

      // PhonkAlphabet: Enqueue with stealth parameters
      await taskQueue.add("network-scan", {
        scanId: scan.insertId,
        engagementId: input.engagementId,
        target: input.target,
        stealth: input.scanType === "stealth",
        decoyCount: input.scanType === "stealth" ? 5 : 0,
      });

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "network",
        action: "initiate_stealth_scan",
        details: JSON.stringify({ target: input.target, type: input.scanType }),
        status: "success",
      });

      return { success: true, scanId: scan.insertId };
    }),

  getTopology: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      await assertEngagementOwnership(input.engagementId, ctx.user.id);
      const topology = await NetworkTopologyEngine.buildTopology(
        input.engagementId,
      );
      const attackVectors =
        NetworkTopologyEngine.suggestAttackVectors(topology);

      return { ...topology, attackVectors };
    }),
});
