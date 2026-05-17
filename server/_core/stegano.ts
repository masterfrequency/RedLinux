import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const STEGO_MARKER = "---SHADOW-CAST---";
export async function hideDataInImage(
  imagePath: string,
  data: string,
  key: string = "default-shadow-key",
): Promise<string> {
  if (!fs.existsSync(imagePath))
    throw new Error(`Carrier image not found: ${imagePath}`);
  const buffer = fs.readFileSync(imagePath);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    crypto.scryptSync(key, "salt", 32),
    Buffer.alloc(16, 0),
  );
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  const payload = Buffer.from(
    `${STEGO_MARKER}${encrypted}${STEGO_MARKER}`,
    "utf8",
  );
  const combined = Buffer.concat([buffer, payload]);
  const outputPath = path.join(
    path.dirname(imagePath),
    `stego_${crypto.randomBytes(4).toString("hex")}_${path.basename(imagePath)}`,
  );
  fs.writeFileSync(outputPath, combined);
  return outputPath;
}
export function extractDataFromImage(
  imagePath: string,
  key: string = "default-shadow-key",
): string {
  if (!fs.existsSync(imagePath))
    throw new Error(`Image not found: ${imagePath}`);
  const buffer = fs.readFileSync(imagePath);
  const content = buffer.toString("utf8");
  const parts = content.split(STEGO_MARKER);
  if (parts.length < 3)
    throw new Error("No shadow payload detected in the carrier image.");
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    crypto.scryptSync(key, "salt", 32),
    Buffer.alloc(16, 0),
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
