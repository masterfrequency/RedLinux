import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  engagements,
  ghostC2Channels,
  operatorSessionLogs,
} from "../../drizzle/schema";

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

import { ghostC2Agents, ghostC2Tasks } from "../../drizzle/schema";
import { GhostC2Engine } from "../_core/ghostEngine";

export const ghostRouter = router({
  getChannels: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(ghostC2Channels)
        .where(eq(ghostC2Channels.engagementId, input.engagementId));
    }),

  getAgents: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(ghostC2Agents)
        .where(eq(ghostC2Agents.engagementId, input.engagementId));
    }),

  getTasks: protectedProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      return db
        .select()
        .from(ghostC2Tasks)
        .where(eq(ghostC2Tasks.agentId, input.agentId))
        .orderBy(desc(ghostC2Tasks.createdAt));
    }),

  issueCommand: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        command: z.string(),
        args: z.any().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return GhostC2Engine.queueTask(input.agentId, input.command, input.args);
    }),

  createChannel: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        channelName: z
          .string()
          .min(3)
          .max(80)
          .regex(
            /^[a-zA-Z0-9_.:-]+$/,
            "channel name contains unsupported characters",
          ),
        channelType: z.enum([
          "https",
          "dns",
          "icmp",
          "steganographic",
          "custom",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      await db.insert(ghostC2Channels).values({
        engagementId: input.engagementId,
        channelName: input.channelName,
        channelType: input.channelType,
        status: "active",
        encryptionMethod: "aes256-gcm",
        heartbeatInterval: 300,
      });

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "ghost",
        action: "create_telemetry_channel",
        details: JSON.stringify({
          name: input.channelName,
          type: input.channelType,
        }),
        status: "success",
      });

      return { success: true };
    }),

  killChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.number().int().positive(),
        engagementId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      await db
        .update(ghostC2Channels)
        .set({ status: "killed" })
        .where(
          and(
            eq(ghostC2Channels.id, input.channelId),
            eq(ghostC2Channels.engagementId, input.engagementId),
          ),
        );

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "ghost",
        action: "terminate_telemetry_channel",
        details: JSON.stringify({ channelId: input.channelId }),
        status: "success",
      });

      return { success: true };
    }),
});
