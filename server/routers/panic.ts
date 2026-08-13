import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { operatorSessionLogs } from "../../drizzle/schema";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * PhonkAlphabet's Scorched Earth Protocol
 * Multi-pass shredding, metadata wiping, and self-destruct sequences.
 */

async function secureShred(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const stats = fs.statSync(filePath);
  const size = stats.size;
  const fd = fs.openSync(filePath, "r+");

  try {
    // Pass 1: Zeroes
    fs.writeSync(fd, Buffer.alloc(size, 0), 0, size, 0);
    // Pass 2: Ones
    fs.writeSync(fd, Buffer.alloc(size, 0xff), 0, size, 0);
    // Pass 3: Random Data
    fs.writeSync(fd, crypto.randomBytes(size), 0, size, 0);

    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  // Rename to random string before unlinking to wipe filename metadata
  const dir = path.dirname(filePath);
  const randomName = path.join(dir, crypto.randomBytes(16).toString("hex"));
  fs.renameSync(filePath, randomName);
  fs.unlinkSync(randomName);
}

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

      // 1. Securely shred the vault directory
      const vaultDir = path.join(process.cwd(), "vault");
      if (fs.existsSync(vaultDir)) {
        const files = fs.readdirSync(vaultDir);
        for (const file of files) {
          await secureShred(path.join(vaultDir, file));
        }
        fs.rmdirSync(vaultDir);
      }

      // 2. Wipe temporary artifacts
      const tmpDir = path.join(process.cwd(), "tmp");
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        for (const file of files) {
          await secureShred(path.join(tmpDir, file));
        }
      }

      // 3. Log the purge action (Final log before DB wipe if implemented)
      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "panic",
        action: "scorched_earth_purge",
        details: JSON.stringify({
          timestamp: new Date(),
          operator: ctx.user.id,
          method: "3-pass-shredding",
        }),
        status: "success",
      });

      return {
        success: true,
        message: "Scorched Earth Protocol complete. All traces neutralized.",
      };
    }),
});
