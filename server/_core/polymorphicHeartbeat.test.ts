import { describe, it, expect } from "vitest";
import {
  generateJitterCron,
  generatePolymorphicPayload,
} from "./polymorphicHeartbeat";

describe("generateJitterCron", () => {
  it("returns a valid 6-field cron expression (sec min hour dom dow)", () => {
    const cron = generateJitterCron(15);
    const parts = cron.split(" ");
    expect(parts).toHaveLength(6);
    expect(Number(parts[0])).toBeGreaterThanOrEqual(0);
    expect(Number(parts[0])).toBeLessThan(60);
    expect(parts[1]).toMatch(/^\*\/\d+$/);
    expect(parts[2]).toBe("*");
    expect(parts[3]).toBe("*");
    expect(parts[4]).toBe("*");
    expect(parts[5]).toBe("*");
  });

  it("jitters around the base interval within +/-20%", () => {
    for (let i = 0; i < 200; i++) {
      const cron = generateJitterCron(60);
      const minutes = parseInt(cron.split(" ")[1].replace("*/", ""), 10);
      expect(minutes).toBeGreaterThanOrEqual(48); // 60 * 0.8
      expect(minutes).toBeLessThanOrEqual(72); // 60 * 1.2
    }
  });

  it("never emits a sub-minute interval", () => {
    for (let i = 0; i < 50; i++) {
      const cron = generateJitterCron(1);
      const minutes = parseInt(cron.split(" ")[1].replace("*/", ""), 10);
      expect(minutes).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("generatePolymorphicPayload", () => {
  it("preserves original payload and adds noise metadata", () => {
    const original = { cmd: "whoami", target: "10.0.0.5" };
    const out = generatePolymorphicPayload(original);

    expect(out.cmd).toBe("whoami");
    expect(out.target).toBe("10.0.0.5");

    expect(out._meta).toBeDefined();
    expect(out._meta.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(out._meta.version).toBe("4.1.0-stable");
    expect(typeof out._meta.timestamp).toBe("string");
    expect(out._padding.length).toBeGreaterThan(0);
  });

  it("produces distinct noise on each call", () => {
    const a = generatePolymorphicPayload({ x: 1 });
    const b = generatePolymorphicPayload({ x: 1 });
    expect(a._meta.traceId).not.toBe(b._meta.traceId);
    expect(a._padding).not.toBe(b._padding);
  });

  it("handles empty payloads", () => {
    const out = generatePolymorphicPayload({});
    expect(out._meta).toBeDefined();
    expect(out._padding).toBeDefined();
  });
});
