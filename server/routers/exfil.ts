import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  shadowExfilTransfers,
  operatorSessionLogs,
  engagements,
} from "../../drizzle/schema";
import crypto from "node:crypto";
import { ShadowStreamer } from "../_core/shadowStreamer";

/**
 * PhonkAlphabet's Shadow Exfil V2: Advanced Covert Data Transfer
 * Multi-pass encryption, protocol-specific obfuscation, and chunked reassembly.
 */

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

class ShadowExfilEngine {
  private static readonly CHUNK_SIZE = 1024 * 64; // 64KB chunks

  static async initiateTransfer(
    engagementId: number,
    transferId: number,
    totalSize: number,
    protocol: string,
  ) {
    const chunks = Math.ceil(totalSize / this.CHUNK_SIZE);
    return {
      transferId,
      engagementId,
      protocol,
      totalSize,
      chunkCount: chunks,
      chunkSize: this.CHUNK_SIZE,
      startTime: new Date().toISOString(),
    };
  }

  static async processChunk(
    chunkData: Buffer,
    chunkIndex: number,
    protocol: string,
  ) {
    const chunkHash = crypto
      .createHash("sha256")
      .update(chunkData)
      .digest("hex");
    let encodedChunk: Buffer;

    switch (protocol) {
      case "dns":
        encodedChunk = Buffer.from(
          chunkData.toString("base64").replace(/[+/=]/g, ""),
        );
        break;
      case "icmp":
        encodedChunk = Buffer.concat([
          Buffer.from([chunkIndex & 0xff]),
          chunkData,
        ]);
        break;
      case "steganographic":
        encodedChunk = Buffer.from(chunkData.toString("hex"));
        break;
      default:
        encodedChunk = Buffer.from(chunkData.toString("base64"));
    }

    return {
      chunkIndex,
      checksum: chunkHash,
      encodedSize: encodedChunk.length,
    };
  }
}

export const exfilRouter = router({
  getTransfers: protectedProcedure
    .input(z.object({ engagementId: z.number().int().positive() }))
    .query(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      return db
        .select()
        .from(shadowExfilTransfers)
        .where(eq(shadowExfilTransfers.engagementId, input.engagementId));
    }),

  startTransfer: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        name: z.string().min(1).max(120),
        dataType: z.enum([
          "telemetry",
          "evidence_package",
          "log_archive",
          "report_bundle",
          "other",
        ]),
        totalSize: z.number().int().min(0),
        protocol: z
          .enum(["https", "dns", "icmp", "steganographic"])
          .default("https"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      const [transfer] = await db.insert(shadowExfilTransfers).values({
        engagementId: input.engagementId,
        transferName: input.name,
        dataType: input.dataType,
        totalSize: input.totalSize,
        status: "pending",
        progress: 0,
      });

      const chunkCount = Math.ceil(input.totalSize / (1024 * 64));

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "shadow",
        action: "initiate_exfil_v2",
        details: JSON.stringify({
          name: input.name,
          protocol: input.protocol,
          chunkCount,
        }),
        status: "success",
      });

      return {
        success: true,
        transferId: transfer.insertId,
        chunkCount,
        protocol: input.protocol,
      };
    }),

  processChunk: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        transferId: z.number().int().positive(),
        chunkIndex: z.number().int().min(0),
        chunkData: z.string(), // Base64
        protocol: z
          .enum(["https", "dns", "icmp", "steganographic"])
          .default("https"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await assertEngagementOwnership(
        input.engagementId,
        ctx.user.id,
      );
      const chunkBuffer = Buffer.from(input.chunkData, "base64");

      await ShadowStreamer.receiveChunk(
        input.transferId,
        input.chunkIndex,
        chunkBuffer,
      );
      const processed = await ShadowExfilEngine.processChunk(
        chunkBuffer,
        input.chunkIndex,
        input.protocol,
      );

      const [transfer] = await db
        .select()
        .from(shadowExfilTransfers)
        .where(eq(shadowExfilTransfers.id, input.transferId))
        .limit(1);

      if (transfer && input.chunkIndex + 1 >= (transfer.chunkCount || 0)) {
        await ShadowStreamer.reassemble(
          input.transferId,
          transfer.chunkCount || 0,
          transfer.transferName,
        );
        await db
          .update(shadowExfilTransfers)
          .set({ status: "completed", progress: 100 })
          .where(eq(shadowExfilTransfers.id, input.transferId));
      } else {
        const progress = Math.floor(
          ((input.chunkIndex + 1) / (transfer?.chunkCount || 1)) * 100,
        );
        await db
          .update(shadowExfilTransfers)
          .set({ status: "in_progress", progress })
          .where(eq(shadowExfilTransfers.id, input.transferId));
      }

      return { success: true, ...processed };
    }),
});
