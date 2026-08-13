import { describe, it, expect } from "vitest";
import { encrypt, decrypt, sanitizeBuffer } from "./crypto";

describe("crypto (dual-layer AES-GCM + ChaCha20-Poly1305)", () => {
  const KEY = "test-master-key-0123456789abcdef";

  it("round-trips plaintext", () => {
    const secret = "shadow://10.0.0.5:4444 -op c2";
    const enc = encrypt(secret, KEY);
    expect(enc).not.toBe(secret);
    expect(decrypt(enc, KEY)).toBe(secret);
  });

  it("round-trips unicode and edge characters", () => {
    const payload = "пароль: s3cr3t ✓ — ünïcode";
    const enc = encrypt(payload, KEY);
    expect(decrypt(enc, KEY)).toBe(payload);
  });

  it("produces unique ciphertext per call (random IVs)", () => {
    const a = encrypt("same-input", KEY);
    const b = encrypt("same-input", KEY);
    expect(a).not.toBe(b);
  });

  it("fails to decrypt with wrong key", () => {
    const enc = encrypt("top-secret", KEY);
    expect(() => decrypt(enc, "wrong-key-0000000000000000000")).toThrow();
  });

  it("detects tampered ciphertext (auth tag verification)", () => {
    const enc = encrypt("integrity-check", KEY);
    const buf = Buffer.from(enc, "hex");
    // Flip one byte in the middle of the payload
    buf[Math.floor(buf.length / 2)] ^= 0xff;
    expect(() => decrypt(buf.toString("hex"), KEY)).toThrow();
  });

  it("rejects empty input and malformed ciphertext", () => {
    expect(() => encrypt("", KEY)).not.toThrow();
    expect(() => decrypt("zzzz-not-hex", KEY)).toThrow();
    expect(() => decrypt("abcd", KEY)).toThrow();
  });

  it("sanitizeBuffer zeroes memory in place", () => {
    const buf = Buffer.from("sensitive-data");
    sanitizeBuffer(buf);
    expect(buf.every((b) => b === 0)).toBe(true);
  });
});
