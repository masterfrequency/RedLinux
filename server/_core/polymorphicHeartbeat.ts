import {
  createHeartbeatJob,
  updateHeartbeatJob,
  HeartbeatJob,
} from "./heartbeat";
import crypto from "node:crypto";

export function generateJitterCron(baseMinutes: number = 15): string {
  // Use crypto for jitter calculation
  const jitter = ((crypto.randomInt(0, 100) - 50) / 100) * 0.4; // +/- 20% jitter
  const targetMinutes = Math.max(1, Math.round(baseMinutes * (1 + jitter)));
  const randomSecond = crypto.randomInt(0, 60);
  return `${randomSecond} */${targetMinutes} * * * *`;
}

export function generatePolymorphicPayload(originalPayload: any): any {
  const noise = {
    _meta: {
      traceId: crypto.randomBytes(16).toString("hex"),
      timestamp: new Date().toISOString(),
      entropy: crypto.randomBytes(crypto.randomInt(32, 129)).toString("base64"),
      version: "4.1.0-stable",
    },
    _padding: crypto.randomBytes(crypto.randomInt(64, 257)).toString("hex"),
  };
  return { ...originalPayload, ...noise };
}

export async function createPolymorphicHeartbeat(
  job: Omit<HeartbeatJob, "cron"> & { baseMinutes?: number },
  userSession: string,
) {
  const cron = generateJitterCron(job.baseMinutes || 15);
  const payload = generatePolymorphicPayload(job.payload);
  return createHeartbeatJob({ ...job, cron, payload }, userSession);
}

export async function rotateHeartbeat(
  taskUid: string,
  baseMinutes: number,
  originalPayload: any,
  userSession: string,
) {
  const cron = generateJitterCron(baseMinutes);
  const payload = generatePolymorphicPayload(originalPayload);
  return updateHeartbeatJob(taskUid, { cron, payload }, userSession);
}
