import { getDb } from "../db";
import { lootVaultItems } from "../../drizzle/schema";
import { encrypt, decrypt } from "./crypto";
import { ENV } from "./env";
import { eq, and } from "drizzle-orm";
import crypto from "node:crypto";

/**
 * Obsidian Persistence Layer:
 * Hardened encrypted cache for sensitive operational data with mandatory key derivation
 */

/**
 * Derive a secure encryption key from the operator's session and engagement context
 */
function deriveObsidianKey(engagementId: number, operatorId?: string): string {
  const baseKey = ENV.forgeApiKey;

  if (!baseKey || baseKey.length === 0) {
    throw new Error(
      "Obsidian Core: FORGE_API_KEY is not configured. Persistent encryption is unavailable. Set FORGE_API_KEY in your environment.",
    );
  }

  // Derive a unique key per engagement using HKDF
  const salt = Buffer.from(
    `obsidian-${engagementId}${operatorId ? `-${operatorId}` : ""}`,
  );
  const derivedKey = crypto.hkdfSync(
    "sha256",
    baseKey,
    salt,
    Buffer.from("obsidian-persistence"),
    32,
  );

  return Buffer.from(derivedKey).toString("hex");
}

type ObsidianItemType =
  | "hash"
  | "credential"
  | "document"
  | "key"
  | "token"
  | "other";

export async function sealToObsidian(
  engagementId: number,
  name: string,
  data: string,
  type: ObsidianItemType = "document",
  operatorId?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Obsidian Core unavailable: Database offline.");

  // Derive secure key
  const derivedKey = deriveObsidianKey(engagementId, operatorId);

  // Encrypt data with derived key
  const encryptedData = encrypt(data, derivedKey);

  // Create integrity hash
  const integrityHash = crypto
    .createHmac("sha256", derivedKey)
    .update(data)
    .digest("hex");

  // Store with metadata
  await db.insert(lootVaultItems).values({
    engagementId,
    name,
    itemType: type,
    category: "obsidian_cache",
    encryptedData,
    dataHash: integrityHash,
    source: `obsidian-${new Date().toISOString()}`,
  });

  return {
    success: true,
    name,
    sealedAt: new Date().toISOString(),
    integrityHash: integrityHash.slice(0, 16),
  };
}

export async function unsealFromObsidian(
  itemId: number,
  engagementId: number,
  operatorId?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Obsidian Core unavailable: Database offline.");

  const [item] = await db
    .select()
    .from(lootVaultItems)
    .where(
      and(
        eq(lootVaultItems.id, itemId),
        eq(lootVaultItems.engagementId, engagementId),
      ),
    );

  if (!item) throw new Error("Item not found in Obsidian Vault.");

  // Derive the same key used for encryption
  const derivedKey = deriveObsidianKey(engagementId, operatorId);

  // Decrypt data
  const decryptedData = decrypt(item.encryptedData, derivedKey);

  // Verify integrity
  const expectedHash = crypto
    .createHmac("sha256", derivedKey)
    .update(decryptedData)
    .digest("hex");
  if (expectedHash !== item.dataHash) {
    throw new Error(
      "Obsidian Vault: Data integrity check failed. Item may have been tampered with.",
    );
  }

  return {
    ...item,
    decryptedData,
    integrityVerified: true,
    decryptedAt: new Date().toISOString(),
  };
}

export async function listObsidianCache(engagementId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(lootVaultItems)
    .where(
      and(
        eq(lootVaultItems.engagementId, engagementId),
        eq(lootVaultItems.category, "obsidian_cache"),
      ),
    );
}

export async function rotateObsidianKey(
  engagementId: number,
  operatorId?: string,
) {
  const db = await getDb();
  if (!db) throw new Error("Obsidian Core unavailable: Database offline.");

  // Fetch all items in the vault
  const items = await listObsidianCache(engagementId);

  // Re-encrypt all items with the new derived key
  const oldKey = deriveObsidianKey(engagementId, operatorId);
  const newKey = deriveObsidianKey(
    engagementId,
    `${operatorId}-rotated-${Date.now()}`,
  );

  for (const item of items) {
    try {
      // Decrypt with old key
      const decryptedData = decrypt(item.encryptedData, oldKey);

      // Re-encrypt with new key
      const newEncryptedData = encrypt(decryptedData, newKey);
      const newHash = crypto
        .createHmac("sha256", newKey)
        .update(decryptedData)
        .digest("hex");

      // Update in database
      await db
        .update(lootVaultItems)
        .set({
          encryptedData: newEncryptedData,
          dataHash: newHash,
        })
        .where(eq(lootVaultItems.id, item.id));
    } catch (error) {
      console.error(`Failed to rotate key for item ${item.id}:`, error);
    }
  }

  return {
    success: true,
    itemsRotated: items.length,
    rotatedAt: new Date().toISOString(),
  };
}
