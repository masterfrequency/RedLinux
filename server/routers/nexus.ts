import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  engagements,
  nexusExploitFindings,
  operatorSessionLogs,
} from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

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

export const nexusRouter = router({
  getFindings: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(nexusExploitFindings)
        .where(eq(nexusExploitFindings.engagementId, input.engagementId));
    }),

  synthesizeExploit: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        vulnerabilityId: z.number().int().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      const [vuln] = await db
        .select()
        .from(nexusExploitFindings)
        .where(
          and(
            eq(nexusExploitFindings.id, input.vulnerabilityId),
            eq(nexusExploitFindings.engagementId, input.engagementId),
          ),
        )
        .limit(1);
      if (!vuln) throw new Error("Vulnerability finding not found");

      const aiResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are Nexus, the Exploit Synthesis Engine. Generate tactical, weaponized proof-of-concept code and exploitation strategies for authorized red team operations. Provide step-by-step exploitation techniques, payload delivery methods, and post-exploitation guidance. Output must be production-ready and immediately deployable.",
          },
          {
            role: "user",
            content: `Vulnerability: ${vuln.vulnerabilityName}\nCVE: ${vuln.cveId || "Not Assigned"}\nTarget Context: ${vuln.affectedTarget || "Target context not specified"}\nSeverity: ${vuln.severity}`,
          },
        ],
      });

      const exploitCode = aiResponse.choices[0].message.content || "";

      await db
        .update(nexusExploitFindings)
        .set({
          exploitStatus: "attempted",
          executionLog: JSON.stringify([
            {
              action: "exploit_synthesis",
              timestamp: new Date().toISOString(),
              result: "success",
            },
          ]),
        })
        .where(
          and(
            eq(nexusExploitFindings.id, input.vulnerabilityId),
            eq(nexusExploitFindings.engagementId, input.engagementId),
          ),
        );

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "nexus",
        action: "exploit_synthesis",
        details: JSON.stringify({
          vulnerability: vuln.vulnerabilityName,
          cve: vuln.cveId,
        }),
        status: "success",
      });

      return {
        success: true,
        exploitCode,
      };
    }),

  logVulnerability: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        vulnerabilityName: z.string().min(1).max(255),
        severity: z.enum(["critical", "high", "medium", "low", "info"]),
        cveId: z.string().max(32).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      await db.insert(nexusExploitFindings).values({
        engagementId: input.engagementId,
        vulnerabilityName: input.vulnerabilityName,
        severity: input.severity,
        cveId: input.cveId,
        exploitStatus: "discovered",
      });
      return { success: true };
    }),
});
