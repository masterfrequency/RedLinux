import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  aetherReconFindings,
  specterEvasionSignatures,
  nexusExploitFindings,
  ghostC2Channels,
  lootVaultItems,
  operatorSessionLogs,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * PhonkAlphabet's Aether V2: Automated Intelligence Synthesis
 * Deep enrichment and automated attack surface analysis.
 */

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
                "You are Aether-Alpha, a supreme OSINT analyst. Analyze the provided reconnaissance finding and provide deep technical enrichment, potential attack vectors, and related infrastructure in JSON format.",
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
        confidence = 95;
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

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "aether",
        action: "create_recon_finding",
        details: JSON.stringify({
          target: input.targetValue,
          enriched: !!input.autoEnrich,
        }),
        status: "success",
      });

      return { success: true };
    }),

  synthesizeAttackSurface: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database offline");

      const findings = await db
        .select()
        .from(aetherReconFindings)
        .where(eq(aetherReconFindings.engagementId, input.engagementId));

      const aiResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are Aether-Alpha. Synthesize the provided reconnaissance findings into a comprehensive attack surface map. Identify high-value targets, weak points, and recommended entry vectors.",
          },
          {
            role: "user",
            content: `Findings:\n${JSON.stringify(findings)}`,
          },
        ],
      });

      const synthesis = aiResponse.choices[0].message.content || "";

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "aether",
        action: "synthesize_attack_surface",
        details: JSON.stringify({ findingsCount: findings.length }),
        status: "success",
      });

      return { success: true, synthesis };
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
});
