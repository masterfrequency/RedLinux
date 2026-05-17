import crypto from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const CHACHA_ALGORITHM = "chacha20-poly1305";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * MemorySanitizer: Explicitly zero out sensitive buffers
 */
export function sanitizeBuffer(buf: Buffer) {
  buf.fill(0);
}

/**
 * QuantumVault: Multi-layer encryption (AES-256-GCM + ChaCha20-Poly1305)
 */
export function encrypt(text: string, key: string): string {
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(key, salt, 64); // 64 bytes for two 32-byte keys

  const aesKey = derivedKey.subarray(0, 32);
  const chachaKey = derivedKey.subarray(32, 64);

  // Layer 1: ChaCha20-Poly1305
  const iv1 = crypto.randomBytes(IV_LENGTH);
  const cipher1 = crypto.createCipheriv(CHACHA_ALGORITHM, chachaKey, iv1, {
    authTagLength: AUTH_TAG_LENGTH,
  } as any);
  let encrypted1 = cipher1.update(text, "utf8");
  encrypted1 = Buffer.concat([encrypted1, cipher1.final()]);
  const tag1 = (cipher1 as any).getAuthTag();

  // Layer 2: AES-256-GCM
  const iv2 = crypto.randomBytes(IV_LENGTH);
  const cipher2 = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv2);
  let encrypted2 = cipher2.update(Buffer.concat([iv1, tag1, encrypted1]));
  encrypted2 = Buffer.concat([encrypted2, cipher2.final()]);
  const tag2 = cipher2.getAuthTag();

  const result = Buffer.concat([salt, iv2, tag2, encrypted2]).toString("hex");

  // Sanitize sensitive keys
  sanitizeBuffer(derivedKey);

  return result;
}

export function decrypt(encryptedHex: string, key: string): string {
  const data = Buffer.from(encryptedHex, "hex");

  const salt = data.subarray(0, 16);
  const iv2 = data.subarray(16, 28);
  const tag2 = data.subarray(28, 44);
  const encrypted2 = data.subarray(44);

  const derivedKey = crypto.scryptSync(key, salt, 64);
  const aesKey = derivedKey.subarray(0, 32);
  const chachaKey = derivedKey.subarray(32, 64);

  // Decrypt Layer 2: AES-256-GCM
  const decipher2 = crypto.createDecipheriv(AES_ALGORITHM, aesKey, iv2);
  decipher2.setAuthTag(tag2);
  let decrypted2 = decipher2.update(encrypted2);
  decrypted2 = Buffer.concat([decrypted2, decipher2.final()]);

  const iv1 = decrypted2.subarray(0, 12);
  const tag1 = decrypted2.subarray(12, 28);
  const encrypted1 = decrypted2.subarray(28);

  // Decrypt Layer 1: ChaCha20-Poly1305
  const decipher1 = crypto.createDecipheriv(CHACHA_ALGORITHM, chachaKey, iv1, {
    authTagLength: AUTH_TAG_LENGTH,
  } as any);
  decipher1.setAuthTag(tag1);
  let decrypted1 = decipher1.update(encrypted1);
  decrypted1 = Buffer.concat([decrypted1, decipher1.final()]);

  const result = decrypted1.toString("utf8");

  // Sanitize sensitive keys
  sanitizeBuffer(derivedKey);

  return result;
}
