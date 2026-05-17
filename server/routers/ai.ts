import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { downloadGGUF, listModels } from "../_core/aiModelService";
import { getDb } from "../db";
import { engagements, operatorSessionLogs } from "../../drizzle/schema";
import { logAudit } from "../_core/security";
import { invokeLLM } from "../_core/llm";

const DEFENSIVE_STRATEGIST_PROMPT = `
You are RedLinux Defensive Assessment Strategist. Produce authorized security assessment plans that emphasize scope control, asset inventory, vulnerability validation, detection engineering, remediation, evidence handling, and executive reporting.
Do not provide exploit code, credential theft steps, persistence instructions, stealth guidance, destructive actions, or instructions for unauthorized access.
`.trim();

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

export const aiRouter = router({
  getModels: publicProcedure.query(async () => {
    return listModels();
  }),

  downloadModel: protectedProcedure
    .input(
      z.object({
        repo: z
          .string()
          .regex(/^[\w.-]+\/[\w.-]+$/, "repo must be a Hugging Face repo id"),
        filename: z
          .string()
          .regex(
            /^[\w./-]+\.gguf$/,
            "filename must reference a GGUF model file",
          ),
      }),
    )
    .mutation(async ({ input }) => downloadGGUF(input.repo, input.filename)),

  generateStrategy: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        targetInfo: z.string().min(1).max(4000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      const response = await invokeLLM({
        messages: [
          { role: "system", content: DEFENSIVE_STRATEGIST_PROMPT },
          {
            role: "user",
            content: `Create a production-ready defensive assessment plan for this authorized scope. Include objectives, assumptions, validation steps, detection opportunities, remediation priorities, evidence to collect, and out-of-scope boundaries. Scope details: ${input.targetInfo}`,
          },
        ],
      });

      const strategy =
        typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : JSON.stringify(response.choices[0].message.content);

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "ai",
        action: "generate_defensive_strategy",
        details: JSON.stringify({ targetLength: input.targetInfo.length }),
        status: "success",
      });

      await logAudit(input.engagementId, "DEFENSIVE_STRATEGY_GENERATED", {
        targetLength: input.targetInfo.length,
      });

      return {
        strategy,
        systemPrompt: DEFENSIVE_STRATEGIST_PROMPT,
      };
    }),
});
