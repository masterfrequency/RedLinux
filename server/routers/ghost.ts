import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  engagements,
  ghostC2Channels,
  operatorSessionLogs,
  ghostC2Agents,
  ghostC2Tasks,
} from "../../drizzle/schema";
import { GhostC2Engine } from "../_core/ghostEngine";

/**
 * PhonkAlphabet's Ghost C2 V2: Advanced Command & Control
 * Real-time tasking, polymorphic implants, and multi-protocol support.
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

  generateImplant: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        channelId: z.number().int().positive(),
        os: z.enum(["windows", "linux"]),
        arch: z.enum(["x64", "arm64"]).default("x64"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await assertEngagementOwnership(input.engagementId, ctx.user.id);
      const implant = GhostC2Engine.generateImplant(input.channelId, input.os);
      
      const db = await getDb();
      if (db) {
        await db.insert(operatorSessionLogs).values({
          engagementId: input.engagementId,
          userId: ctx.user.id,
          module: "ghost",
          action: "generate_implant",
          details: JSON.stringify({ os: input.os, arch: input.arch, agentId: implant.agentId }),
          status: "success",
        });
      }

      return {
        success: true,
        ...implant,
        instructions: [
          `1. Deploy ${input.os} implant on target.`,
          `2. Implant will check-in via configured channel.`,
          `3. Use 'issueCommand' to interact with the agent.`,
        ],
      };
    }),

  createChannel: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        channelName: z.string().min(3).max(80),
        channelType: z.enum(["https", "dns", "icmp", "steganographic", "custom"]),
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
        action: "create_c2_channel",
        details: JSON.stringify({ name: input.channelName, type: input.channelType }),
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

      return { success: true };
    }),
});
