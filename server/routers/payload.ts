import crypto from "node:crypto";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  specterEvasionSignatures,
  operatorSessionLogs,
} from "../../drizzle/schema";

const SAFE_FORMAT_EXTENSIONS: Record<string, string> = {
  exe: "manifest.json",
  elf: "manifest.json",
  macho: "manifest.json",
  dll: "manifest.json",
  so: "manifest.json",
  reflective_dll: "manifest.json",
  shellcode: "manifest.json",
};

function normalizeArtifactName(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "training-artifact"
  );
}

export const payloadRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        engagementId: z.number().int().positive(),
        name: z.string().min(1).max(80),
        os: z.enum(["windows", "linux", "macos"]),
        arch: z.enum(["x64", "x86", "arm64"]),
        format: z.enum([
          "exe",
          "elf",
          "macho",
          "dll",
          "so",
          "reflective_dll",
          "shellcode",
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const safeName = normalizeArtifactName(input.name);
      const payloadName = `${safeName}_${input.os}_${input.arch}.${SAFE_FORMAT_EXTENSIONS[input.format]}`;
      const generatedAt = new Date().toISOString();
      const manifest = {
        artifactType: "defensive-training-manifest",
        name: safeName,
        requestedFormat: input.format,
        target: {
          os: input.os,
          architecture: input.arch,
        },
        safeguards: [
          "No executable payload, shellcode, exploit, persistence, evasion, or credential access code is generated.",
          "Use this manifest to document authorized lab exercises and defensive validation plans.",
          "Attach only benign fixtures or internally approved samples through your controlled CI/CD process.",
        ],
        recommendedValidation: [
          "Confirm written authorization and engagement scope.",
          "Run all experiments in isolated lab infrastructure.",
          "Record detection objectives, expected telemetry, and rollback steps before execution.",
        ],
        generatedAt,
      };
      const payloadContent = JSON.stringify(manifest, null, 2);
      const manifestHash = crypto
        .createHash("sha256")
        .update(payloadContent)
        .digest("hex");

      const [signature] = await db.insert(specterEvasionSignatures).values({
        engagementId: input.engagementId,
        payloadName,
        originalHash: manifestHash,
        polymorphicHash: manifestHash,
        edrBypassStatus: "unknown",
      });

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "payload",
        action: "generate_defensive_training_manifest",
        details: JSON.stringify({
          name: payloadName,
          requestedFormat: input.format,
          sha256: manifestHash,
        }),
        status: "success",
      });

      return {
        success: true,
        payloadName,
        payloadContent,
        signatureId: signature.insertId,
        sha256: manifestHash,
      };
    }),
});
