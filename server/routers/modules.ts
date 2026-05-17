import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  aetherReconFindings,
  specterEvasionSignatures,
  nexusExploitFindings,
  ghostC2Channels,
  shadowExfilTransfers,
  lootVaultItems,
  operatorSessionLogs,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createPolymorphicHeartbeat } from "../_core/polymorphicHeartbeat";
import { SwarmOrchestrator } from "../_core/swarm";
import { ThreatMapper } from "../_core/threatMapper";
import {
  sealToObsidian,
  unsealFromObsidian,
  listObsidianCache,
  rotateObsidianKey,
} from "../_core/obsidian";
import { NetworkTopologyEngine } from "../_core/networkTopology";
import { invokeLLM } from "../_core/llm";
import { encrypt, decrypt } from "../_core/crypto";
import { ENV } from "../_core/env";

export const aetherReconRouter = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(aetherReconFindings)
        .where(eq(aetherReconFindings.engagementId, input.engagementId));
    }),
  create: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        targetType: z.string(),
        targetValue: z.string(),
        findingType: z.string(),
        source: z.string().optional(),
        confidence: z.number().optional(),
        autoEnrich: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let findingData = JSON.stringify(input);
      let confidence = input.confidence || 75;

      if (input.autoEnrich) {
        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are the Aether-Alpha. Analyze the provided reconnaissance finding and provide technical enrichment in JSON format.",
            },
            {
              role: "user",
              content: `Finding: ${input.targetType} ${input.targetValue} - ${input.findingType}`,
            },
          ],
          responseFormat: { type: "json_object" },
        });

        const enrichment =
          typeof aiResponse.choices[0].message.content === "string"
            ? JSON.parse(aiResponse.choices[0].message.content)
            : aiResponse.choices[0].message.content;

        findingData = JSON.stringify({ ...input, enrichment });
        confidence = 90;
      }

      await db.insert(aetherReconFindings).values({
        engagementId: input.engagementId,
        targetType: input.targetType,
        targetValue: input.targetValue,
        findingType: input.findingType,
        findingData: findingData,
        source: input.source || "Aether-Alpha",
        confidence: confidence,
      });

      return { success: true };
    }),
  // Pillar III: Swarm Orchestration
  dispatchSwarm: protectedProcedure
    .input(z.object({ engagementId: z.number(), target: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return SwarmOrchestrator.dispatchSwarm(
        input.engagementId,
        input.target,
        Number(ctx.user.id),
      );
    }),
});

export const specterEvasionRouter = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(specterEvasionSignatures)
        .where(eq(specterEvasionSignatures.engagementId, input.engagementId));
    }),
  create: protectedProcedure
    .input(z.object({ engagementId: z.number(), payloadName: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(specterEvasionSignatures).values({
        engagementId: input.engagementId,
        payloadName: input.payloadName,
      });
      return { success: true };
    }),
});

export const nexusExploitRouter = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(nexusExploitFindings)
        .where(eq(nexusExploitFindings.engagementId, input.engagementId));
    }),
  // Pillar V: Automated Threat Surface Mapping
  generateHeatMap: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      return ThreatMapper.generateHeatMap(input.engagementId);
    }),
  // Real Network Topology Analysis
  buildNetworkTopology: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      return NetworkTopologyEngine.buildTopology(input.engagementId);
    }),
  suggestAttackVectors: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const topology = await NetworkTopologyEngine.buildTopology(
        input.engagementId,
      );
      return NetworkTopologyEngine.suggestAttackVectors(topology);
    }),
});

export const ghostC2Router = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(ghostC2Channels)
        .where(eq(ghostC2Channels.engagementId, input.engagementId));
    }),
  create: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        channelName: z.string(),
        protocol: z.string(),
        baseMinutes: z.number().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Pillar II: Polymorphic C2 Heartbeats
      const userSession = ctx.req.cookies["app_session_id"] || "";
      const heartbeat = await createPolymorphicHeartbeat(
        {
          name: `ghost-c2-${input.channelName}-${Date.now()}`,
          baseMinutes: input.baseMinutes || 15,
          path: "/api/scheduled/ghost-checkin",
          payload: {
            engagementId: input.engagementId,
            channelName: input.channelName,
          },
          description: `Polymorphic C2 heartbeat for ${input.channelName}`,
        },
        userSession,
      );

      await db.insert(ghostC2Channels).values({
        engagementId: input.engagementId,
        channelName: input.channelName,
        channelType: input.protocol as any,
        status: "active",
      });

      return { success: true, taskUid: heartbeat.taskUid };
    }),
});

export const lootVaultRouter = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(lootVaultItems)
        .where(eq(lootVaultItems.engagementId, input.engagementId));
    }),
  // Pillar I: Obsidian Persistence Layer
  seal: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        name: z.string(),
        data: z.string(),
        type: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return sealToObsidian(
        input.engagementId,
        input.name,
        input.data,
        input.type,
        String(ctx.user.id),
      );
    }),
  unseal: protectedProcedure
    .input(z.object({ itemId: z.number(), engagementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return unsealFromObsidian(
        input.itemId,
        input.engagementId,
        String(ctx.user.id),
      );
    }),
  listObsidian: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      return listObsidianCache(input.engagementId);
    }),
  rotateKey: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return rotateObsidianKey(input.engagementId, String(ctx.user.id));
    }),
});

// Shadow Exfil router is now in server/routers/exfil.ts
