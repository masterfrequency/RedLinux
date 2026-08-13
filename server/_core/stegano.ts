import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const STEGO_MARKER = "---SHADOW-CAST---";
const MARKER_BUF = Buffer.from(STEGO_MARKER, "utf8");
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Locate all marker positions in a buffer using binary-safe search.
 * Never converts the carrier to a string — JPEG/PNG bytes are not valid UTF-8.
 */
function findMarkers(buffer: Buffer): number[] {
  const positions: number[] = [];
  let idx = buffer.indexOf(MARKER_BUF);
  while (idx !== -1) {
    positions.push(idx);
    idx = buffer.indexOf(MARKER_BUF, idx + MARKER_BUF.length);
  }
  return positions;
}

/**
 * Hide encrypted data inside a carrier image by appending a marker-delimited
 * payload. Uses AES-256-GCM with a random IV per write; the IV and auth tag
 * are stored inside the payload so extraction needs only the key.
 */
export async function hideDataInImage(
  imagePath: string,
  data: string,
  key: string = "default-shadow-key",
): Promise<string> {
  if (!fs.existsSync(imagePath))
    throw new Error(`Carrier image not found: ${imagePath}`);
  if (typeof data !== "string")
    throw new Error("Shadow payload must be a string.");

  const buffer = fs.readFileSync(imagePath);
  // Reject carriers that already contain a shadow payload — no double-casts.
  if (findMarkers(buffer).length > 0)
    throw new Error("Carrier image already contains a shadow payload.");

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    crypto.scryptSync(key, "shadow-salt-v2", 32),
    iv,
  );
  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Payload layout: [IV][AuthTag][Ciphertext]
  const payload = Buffer.concat([
    MARKER_BUF,
    iv,
    authTag,
    encrypted,
    MARKER_BUF,
  ]);
  const combined = Buffer.concat([buffer, payload]);

  const outputPath = path.join(
    path.dirname(imagePath),
    `stego_${crypto.randomBytes(4).toString("hex")}_${path.basename(imagePath)}`,
  );
  fs.writeFileSync(outputPath, combined);
  return outputPath;
}

/**
 * Extract and decrypt a shadow payload from a carrier image.
 */
export function extractDataFromImage(
  imagePath: string,
  key: string = "default-shadow-key",
): string {
  if (!fs.existsSync(imagePath))
    throw new Error(`Image not found: ${imagePath}`);

  const buffer = fs.readFileSync(imagePath);
  const markers = findMarkers(buffer);
  if (markers.length < 2)
    throw new Error("No shadow payload detected in the carrier image.");

  const start = markers[0] + MARKER_BUF.length;
  const end = markers[markers.length - 1];
  const payload = buffer.subarray(start, end);

  if (payload.length < IV_LENGTH + TAG_LENGTH + 1)
    throw new Error("Shadow payload is corrupted or truncated.");

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encryptedData = payload.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    crypto.scryptSync(key, "shadow-salt-v2", 32),
    iv,
  );
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]).toString("utf8");
}
