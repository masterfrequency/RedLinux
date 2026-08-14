/**
 * Pure nmap output parsing + input validation.
 * Kept side-effect free so it can be unit-tested in isolation.
 */

/** Validate a scan target: hostname, IPv4/IPv6, or CIDR — nothing else. */
const TARGET_RE =
  /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?|(?:[0-9a-fA-F:]+)(?:\/\d{1,3})?)$/;

export function assertSafeTarget(target: string): string {
  const t = String(target ?? "").trim();
  if (!t || t.length > 253 || !TARGET_RE.test(t)) {
    throw new Error(`Invalid scan target: ${JSON.stringify(t)}`);
  }
  return t;
}

/** Validate a HuggingFace repo slug: owner/name, letters/digits/-/_. */
const REPO_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

export function assertSafeRepo(repo: string): string {
  const r = String(repo ?? "").trim();
  if (!r || r.length > 128 || !REPO_RE.test(r)) {
    throw new Error(`Invalid model repo: ${JSON.stringify(r)}`);
  }
  return r;
}

/** Validate a filename: no separators, no traversal, no drive letters. */
export function assertSafeFilename(filename: string): string {
  const f = String(filename ?? "").trim();
  if (
    !f ||
    f.length > 255 ||
    f.includes("/") ||
    f.includes("\\") ||
    f.includes("..") ||
    f.includes("\0") ||
    f.startsWith(".")
  ) {
    throw new Error(`Invalid model filename: ${JSON.stringify(f)}`);
  }
  return f;
}

export interface NmapPort {
  port: number;
  protocol: "tcp" | "udp";
  service: string;
  version: string;
}

export interface NmapHost {
  hostname: string;
  ip: string;
  ports: NmapPort[];
  os: string;
}

export function parseNmapOutput(output: string): NmapHost[] {
  const lines = output.split("\n");
  const results: NmapHost[] = [];
  let currentHost: NmapHost | null = null;

  lines.forEach((line) => {
    const hostMatch = line.match(
      /Nmap scan report for ([^\s]+)(?: \(([\d.]+)\))?/,
    );
    if (hostMatch) {
      if (currentHost) results.push(currentHost);
      currentHost = {
        hostname: hostMatch[1],
        ip: hostMatch[2] || hostMatch[1],
        ports: [],
        os: "Unknown",
      };
    }

    const portMatch = line.match(/(\d+)\/(tcp|udp)\s+open\s+([^\s]+)\s*(.*)/);
    if (portMatch && currentHost) {
      currentHost.ports.push({
        port: parseInt(portMatch[1]),
        protocol: portMatch[2] as "tcp" | "udp",
        service: portMatch[3],
        version: portMatch[4].trim(),
      });
    }

    const osMatch = line.match(/Service Info: OS: ([^;]+)/);
    if (osMatch && currentHost) {
      currentHost.os = osMatch[1].trim();
    }
  });

  if (currentHost) results.push(currentHost);
  return results;
}
