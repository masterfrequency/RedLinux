import { z } from "zod";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  engagements,
  operatorSessionLogs,
  specterEvasionSignatures,
} from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

async function assertEngagementOwnership(engagementId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database offline.");
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

// Internal polymorphic engine for deterministic fallback
function localObfuscate(
  source: string,
  language: string,
  antiVM: boolean,
): string {
  let mutated = source;
  if (language === "python") {
    const hex = Buffer.from(source).toString("hex");
    mutated = `import base64\nexec(base64.b16decode('${hex.toUpperCase()}').decode())`;
  } else if (language === "powershell") {
    const b64 = Buffer.from(source, "utf16le").toString("base64");
    mutated = `powershell -e ${b64}`;
  }
  return mutated;
}

export const specterRouter = router({
  list: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(specterEvasionSignatures)
        .where(eq(specterEvasionSignatures.engagementId, input.engagementId));
    }),

  create: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        payloadName: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      const digest = crypto
        .createHash("sha256")
        .update(`${input.payloadName}:${Date.now()}:${ctx.user.id}`)
        .digest("hex");
      await db.insert(specterEvasionSignatures).values({
        engagementId: input.engagementId,
        payloadName: input.payloadName,
        originalHash: digest,
        polymorphicHash: digest,
        edrBypassStatus: "unknown",
      });
      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "specter",
        action: "create_evasion_payload",
        details: JSON.stringify({ payloadName: input.payloadName }),
        status: "success",
      });
      return { success: true };
    }),

  obfuscatePayload: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        sourceCode: z.string().min(1).max(20000),
        language: z.enum(["c", "python", "go", "powershell"]),
        enableAntiVM: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );

      let obfuscatedCode = "";
      try {
        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are Specter, the Evasion Engine. Your task is to generate highly polymorphic and obfuscated code transformations for red team operations. The goal is to bypass advanced Endpoint Detection and Response (EDR) systems, Anti-Malware Scan Interface (AMSI), and behavioral analysis engines. Focus on generating production-ready, immediately deployable code. Incorporate the following evasion strategies:
- **Polymorphism**: Alter the code's appearance while preserving its functionality.
- **Obfuscation**: Employ techniques like string encryption, control flow flattening, dead code insertion, and instruction reordering.
- **Anti-Analysis**: Implement anti-debugging, anti-virtual machine (VM), and anti-sandbox checks.
- **Dynamic Evasion**: Suggest or include techniques for runtime evasion.
- **Code Mutation**: Ensure the generated code is difficult to signature.

Provide the obfuscated code in the specified language. If anti-VM is enabled, integrate robust anti-VM checks. The output should be pure code, without conversational filler.`,
            },
            {
              role: "user",
              content: `Language: ${input.language}\nSource:\n${input.sourceCode}\nAnti-VM: ${input.enableAntiVM ? "ENABLED" : "DISABLED"}`,
            },
          ],
        });
        obfuscatedCode = aiResponse.choices[0].message.content || "";
      } catch (e) {
        // Fallback to local engine if LLM fails
        obfuscatedCode = localObfuscate(
          input.sourceCode,
          input.language,
          input.enableAntiVM,
        );
      }

      const polyHash = crypto
        .createHash("sha256")
        .update(obfuscatedCode)
        .digest("hex");

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "specter",
        action: "obfuscate_payload",
        details: JSON.stringify({
          language: input.language,
          antiVMEnabled: input.enableAntiVM,
          polyHash,
        }),
        status: "success",
      });

      return { success: true, obfuscatedCode, polyHash };
    }),
});
