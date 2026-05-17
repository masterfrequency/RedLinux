import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { operatorSessionLogs } from "../../drizzle/schema";
import fs from "node:fs";
import path from "node:path";

export const panicRouter = router({
  executeEmergencyPurge: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        confirmation: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.confirmation !== "CONFIRM_PURGE") {
        throw new Error("Invalid confirmation code.");
      }

      const db = await getDb();
      if (!db) throw new Error("Database offline.");

      // 1. Securely delete the vault directory
      const vaultDir = path.join(process.cwd(), "vault");
      if (fs.existsSync(vaultDir)) {
        const files = fs.readdirSync(vaultDir);
        for (const file of files) {
          const filePath = path.join(vaultDir, file);
          // Overwrite with zeros before deleting (basic shredding)
          const size = fs.statSync(filePath).size;
          fs.writeFileSync(filePath, Buffer.alloc(size, 0));
          fs.unlinkSync(filePath);
        }
      }

      // 2. Log the purge action
      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "panic",
        action: "emergency_purge",
        details: JSON.stringify({
          timestamp: new Date(),
          operator: ctx.user.id,
        }),
        status: "success",
      } as any);

      return {
        success: true,
        message: "Emergency purge executed. All vault assets shredded.",
      };
    }),
});
