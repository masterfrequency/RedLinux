import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { lootVaultItems, operatorSessionLogs } from "../../drizzle/schema";
import { storagePut } from "../_core/storage";

export const harvestRouter = router({
  submitCredentials: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        source: z.string(),
        username: z.string(),
        password: z.string(),
        metadata: z.any().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database offline.");

      const credData = JSON.stringify({
        username: input.username,
        password: input.password,
        source: input.source,
        metadata: input.metadata,
        capturedAt: new Date().toISOString(),
      });

      // Securely store in the encrypted vault
      const storageInfo = await storagePut(
        `creds/${input.engagementId}/${Date.now()}_${input.username}`,
        credData,
      );

      await db.insert(lootVaultItems).values({
        engagementId: input.engagementId,
        name: `Creds: ${input.username} @ ${input.source}`,
        category: "credential",
        storagePath: storageInfo.key,
        capturedAt: new Date(),
      } as any);

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "harvest",
        action: "credential_capture",
        details: JSON.stringify({ source: input.source, user: input.username }),
        status: "success",
      } as any);

      return { success: true };
    }),
});
