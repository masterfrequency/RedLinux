import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { lootVaultItems, operatorSessionLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../_core/storage";
import crypto from "node:crypto";

export const lootRouter = router({
  getItems: protectedProcedure
    .input(z.object({ engagementId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(lootVaultItems)
        .where(eq(lootVaultItems.engagementId, input.engagementId));
    }),

  addLoot: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        itemName: z.string().min(1),
        itemType: z.enum([
          "hash",
          "credential",
          "document",
          "key",
          "token",
          "other",
        ]),
        content: z.string(),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate hash for deduplication
      const dataHash = crypto
        .createHash("sha256")
        .update(input.content)
        .digest("hex");

      // Securely store the content in the encrypted vault
      const storageInfo = await storagePut(
        `loot/${input.engagementId}/${input.itemName}_${Date.now()}`,
        input.content,
      );

      await db.insert(lootVaultItems).values({
        engagementId: input.engagementId,
        name: input.itemName,
        itemType: input.itemType,
        category: input.itemType, // Using type as category for now
        encryptedData: storageInfo.key, // Store the storage key as the reference
        dataHash: dataHash,
        source: input.source || "Manual Entry",
      } as any);

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "loot",
        action: "add_loot",
        details: JSON.stringify({ name: input.itemName, type: input.itemType }),
        status: "success",
      });

      return { success: true, storageKey: storageInfo.key };
    }),

  deleteLoot: protectedProcedure
    .input(z.object({ itemId: z.number(), engagementId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(lootVaultItems)
        .where(
          and(
            eq(lootVaultItems.id, input.itemId),
            eq(lootVaultItems.engagementId, input.engagementId),
          ),
        );

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "loot",
        action: "delete_loot",
        details: JSON.stringify({ itemId: input.itemId }),
        status: "success",
      });

      return { success: true };
    }),
});
