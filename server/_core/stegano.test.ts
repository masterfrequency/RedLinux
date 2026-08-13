import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { hideDataInImage, extractDataFromImage } from "./stegano";

// 1x1 transparent PNG — valid carrier, binary bytes
const TINY_PNG = Buffer.from(
  "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489" +
    "0000000d4944415478da63fcffff3f030005fe02fea755f3d70000000049454e44ae426082",
  "hex",
);

describe("stegano (AES-256-GCM shadow cast)", () => {
  let dir: string;
  let carrier: string;
  let stegoOut: string;
  const KEY = "stego-test-key-2026";

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "rl-stego-"));
    carrier = path.join(dir, "carrier.png");
    fs.writeFileSync(carrier, TINY_PNG);
  });

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("hides and extracts a payload round-trip", async () => {
    const secret = "shadow-beacon: 192.168.1.50:31337";
    stegoOut = await hideDataInImage(carrier, secret, KEY);
    expect(fs.existsSync(stegoOut)).toBe(true);

    // Carrier bytes must still be intact at the head (appended payload)
    const written = fs.readFileSync(stegoOut);
    expect(written.subarray(0, 8).equals(TINY_PNG.subarray(0, 8))).toBe(true);

    expect(extractDataFromImage(stegoOut, KEY)).toBe(secret);
  });

  it("round-trips binary-ish and unicode payloads", async () => {
    const payload = "token: eyJhbGciOiJIUzI1NiJ9.✓✓✓";
    const out = await hideDataInImage(carrier, payload, KEY);
    expect(extractDataFromImage(out, KEY)).toBe(payload);
  });

  it("fails to extract with wrong key", async () => {
    const out = await hideDataInImage(carrier, "wrong-key-test", KEY);
    expect(() => extractDataFromImage(out, "not-the-key")).toThrow();
  });

  it("detects tampered ciphertext (GCM auth tag)", async () => {
    const out = await hideDataInImage(carrier, "tamper-me", KEY);
    const buf = fs.readFileSync(out);
    // Flip a byte inside the payload region (past the PNG header)
    const payloadStart = buf.indexOf(Buffer.from("---SHADOW-CAST---")) + 32;
    buf[payloadStart] ^= 0xff;
    const tampered = path.join(dir, "tampered.png");
    fs.writeFileSync(tampered, buf);
    expect(() => extractDataFromImage(tampered, KEY)).toThrow();
  });

  it("throws on a clean image with no payload", () => {
    expect(() => extractDataFromImage(carrier, KEY)).toThrow(
      /No shadow payload/,
    );
  });

  it("throws on missing carrier", async () => {
    await expect(
      hideDataInImage(path.join(dir, "nope.png"), "x", KEY),
    ).rejects.toThrow(/not found/);
  });

  it("refuses double-cast of an already-payloaded carrier", async () => {
    await expect(hideDataInImage(stegoOut, "again", KEY)).rejects.toThrow(
      /already contains/,
    );
  });
});
