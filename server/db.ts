import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  engagements,
  InsertEngagement,
  aetherReconFindings,
  specterEvasionSignatures,
  nexusExploitFindings,
  ghostC2Channels,
  shadowExfilTransfers,
  lootVaultItems,
  operatorSessionLogs,
  InsertOperatorSessionLog,
  operatorSettings,
  InsertOperatorSetting,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Engagement queries
 */
export async function getEngagementsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(engagements).where(eq(engagements.userId, userId));
}

export async function getEngagementById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(engagements)
    .where(eq(engagements.id, id))
    .limit(1);
  return result[0];
}

export async function createEngagement(data: InsertEngagement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(engagements).values(data);
  return result;
}

/**
 * Aether Recon queries
 */
export async function getAetherReconFindings(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(aetherReconFindings)
    .where(eq(aetherReconFindings.engagementId, engagementId));
}

/**
 * Specter Evasion queries
 */
export async function getSpecterEvasionSignatures(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(specterEvasionSignatures)
    .where(eq(specterEvasionSignatures.engagementId, engagementId));
}

/**
 * Nexus Exploit queries
 */
export async function getNexusExploitFindings(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(nexusExploitFindings)
    .where(eq(nexusExploitFindings.engagementId, engagementId));
}

/**
 * Ghost C2 queries
 */
export async function getGhostC2Channels(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(ghostC2Channels)
    .where(eq(ghostC2Channels.engagementId, engagementId));
}

/**
 * Shadow Exfil queries
 */
export async function getShadowExfilTransfers(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(shadowExfilTransfers)
    .where(eq(shadowExfilTransfers.engagementId, engagementId));
}

/**
 * Loot Vault queries
 */
export async function getLootVaultItems(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(lootVaultItems)
    .where(eq(lootVaultItems.engagementId, engagementId));
}

/**
 * Operator Session Log queries
 */
export async function getOperatorSessionLogs(engagementId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(operatorSessionLogs)
    .where(eq(operatorSessionLogs.engagementId, engagementId));
}

export async function createOperatorSessionLog(data: InsertOperatorSessionLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(operatorSessionLogs).values(data);
}

/**
 * Operator Settings queries
 */
export async function getOperatorSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(operatorSettings)
    .where(eq(operatorSettings.userId, userId))
    .limit(1);
  return result[0];
}

export async function upsertOperatorSettings(
  userId: number,
  data: Partial<InsertOperatorSetting>,
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .insert(operatorSettings)
    .values({ userId, ...data } as InsertOperatorSetting)
    .onDuplicateKeyUpdate({
      set: data,
    });
}
