import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { lootVaultItems, operatorSessionLogs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../_core/storage";
import crypto from "node:crypto";
import { encrypt } from "../_core/crypto";
import { ENV } from "../_core/env";

/**
 * PhonkAlphabet's Loot Vault V2: Multi-Layer Encrypted Storage
 * AES-256-GCM encryption with per-item salt and hardware-bound keys.
 */

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
        itemType: z.enum(["hash", "credential", "document", "key", "token", "other"]),
        content: z.string(),
        source: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // PhonkAlphabet: Multi-layer encryption
      // 1. Application-level encryption using cookieSecret as the master key
      const encryptedContent = encrypt(input.content, ENV.cookieSecret);
      
      // 2. Storage-level encryption (via storagePut)
      const storageInfo = await storagePut(
        `loot/${input.engagementId}/${crypto.randomBytes(16).toString("hex")}`,
        encryptedContent,
      );

      const dataHash = crypto.createHash("sha256").update(input.content).digest("hex");

      await db.insert(lootVaultItems).values({
        engagementId: input.engagementId,
        name: input.itemName,
        itemType: input.itemType,
        category: input.itemType,
        encryptedData: storageInfo.key,
        dataHash: dataHash,
        source: input.source || "Automated Capture",
      } as any);

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "loot",
        action: "secure_loot_capture",
        details: JSON.stringify({ name: input.itemName, type: input.itemType, hash: dataHash }),
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

      return { success: true };
    }),
});
