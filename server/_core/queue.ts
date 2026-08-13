import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { OSINTNexus } from "./osint";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db";
import { networkScans } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  assertSafeFilename,
  assertSafeRepo,
  assertSafeTarget,
  parseNmapOutput,
} from "./nmapParse";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);

export const taskQueue = new Queue("redlinux-tasks", { connection });

export const taskWorker = new Worker(
  "redlinux-tasks",
  async (job) => {
    console.log(`[Queue] Processing job ${job.id}: ${job.name}`);

    if (job.name === "network-scan") {
      const { scanId, target } = job.data;
      const db = await getDb();
      if (!db) return { success: false, error: "Database offline" };

      try {
        await db
          .update(networkScans)
          .set({ status: "running" })
          .where(eq(networkScans.id, scanId));

        const safeTarget = assertSafeTarget(target);
        const output = execFileSync("nmap", ["-sV", "-T4", safeTarget], {
          encoding: "utf8",
          timeout: 600_000,
          maxBuffer: 64 * 1024 * 1024,
        });
        const parsedResults = parseNmapOutput(output);

        await db
          .update(networkScans)
          .set({
            status: "completed",
            results: JSON.stringify(parsedResults),
          })
          .where(eq(networkScans.id, scanId));

        return { success: true, results: parsedResults };
      } catch (error) {
        await db
          .update(networkScans)
          .set({ status: "failed" })
          .where(eq(networkScans.id, scanId));
        return { success: false, error: "Nmap scan failed" };
      }
    }

    if (job.name === "ai-download") {
      const { repo, filename } = job.data;
      const modelsDir = path.join(process.cwd(), "models");
      if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir);
      const safeRepo = assertSafeRepo(repo);
      const safeFilename = assertSafeFilename(filename);
      const targetPath = path.join(modelsDir, safeFilename);
      try {
        const url = `https://huggingface.co/${safeRepo}/resolve/main/${safeFilename}`;
        execFileSync("curl", ["-L", "-o", targetPath, url], {
          timeout: 600_000,
          stdio: "pipe",
        });
        return { success: true, results: `Model downloaded to ${targetPath}` };
      } catch (error) {
        return { success: false, error: "Download failed" };
      }
    }

    if (job.name === "osint-nexus-scan") {
      const { engagementId, target } = job.data;
      await OSINTNexus.runNexusScan(engagementId, target);
      return { success: true, results: "OSINT Nexus scan completed" };
    }
  },
  { connection },
);
