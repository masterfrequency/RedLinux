import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { OSINTNexus } from "./osint";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getDb } from "../db";
import { networkScans } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const connection = new IORedis(
  process.env.REDIS_URL || "redis://localhost:6379",
  { maxRetriesPerRequest: null },
);

export const taskQueue = new Queue("redlinux-tasks", { connection });

function parseNmapOutput(output: string) {
  const lines = output.split("\n");
  const results: any[] = [];
  let currentHost: any = null;

  lines.forEach((line) => {
    const hostMatch = line.match(
      /Nmap scan report for ([^\s]+)(?: \(([\d.]+)\))?/,
    );
    if (hostMatch) {
      if (currentHost) results.push(currentHost);
      currentHost = {
        hostname: hostMatch[1],
        ip: hostMatch[2] || hostMatch[1],
        ports: [],
        os: "Unknown",
      };
    }

    const portMatch = line.match(/(\d+)\/(tcp|udp)\s+open\s+([^\s]+)\s*(.*)/);
    if (portMatch && currentHost) {
      currentHost.ports.push({
        port: parseInt(portMatch[1]),
        protocol: portMatch[2],
        service: portMatch[3],
        version: portMatch[4].trim(),
      });
    }

    const osMatch = line.match(/Service Info: OS: ([^;]+)/);
    if (osMatch && currentHost) {
      currentHost.os = osMatch[1].trim();
    }
  });

  if (currentHost) results.push(currentHost);
  return results;
}

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

        const output = execSync(`nmap -sV -T4 ${target}`).toString();
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
      const targetPath = path.join(modelsDir, filename);
      try {
        const url = `https://huggingface.co/${repo}/resolve/main/${filename}`;
        execSync(`curl -L -o ${targetPath} ${url}`);
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
