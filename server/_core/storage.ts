import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Secure Shadow Vault Storage:
 * Implements authenticated encrypted storage for captured assets and exfiltrated data.
 * Uses AES-256-GCM with random IVs for production-grade security.
 */

const VAULT_DIR = path.join(process.cwd(), "vault");
const MASTER_KEY =
  process.env.VAULT_MASTER_KEY || "shadow-master-key-2025-production-grade";

if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });

function deriveKey() {
  return crypto.scryptSync(MASTER_KEY, "shadow-salt-v1", 32);
}

export async function storagePut(
  key: string,
  data: string | Buffer,
): Promise<{ key: string; url: string }> {
  const fileKey = crypto.createHash("sha256").update(key).digest("hex");
  const targetPath = path.join(VAULT_DIR, fileKey);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(), iv);

  const inputBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const encrypted = Buffer.concat([cipher.update(inputBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as [IV (12 bytes)][AuthTag (16 bytes)][EncryptedData]
  const finalBuffer = Buffer.concat([iv, authTag, encrypted]);
  fs.writeFileSync(targetPath, finalBuffer);

  return {
    key: fileKey,
    url: `/api/vault/download/${fileKey}`,
  };
}

export async function storageGet(key: string): Promise<Buffer> {
  const targetPath = path.join(VAULT_DIR, key);
  if (!fs.existsSync(targetPath)) throw new Error("Asset not found in vault.");

  const buffer = fs.readFileSync(targetPath);

  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encryptedData = buffer.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}
