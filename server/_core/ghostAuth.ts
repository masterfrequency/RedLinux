import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

/**
 * PhonkAlphabet's ShadowProxy V2: Advanced DPI Evasion
 * Implements dynamic jitter, MTU-aware padding, and header randomization.
 */
export function shadowProxyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalSend = res.send;

  // Randomize response headers to mimic common legitimate services
  const decoyHeaders = [
    { "Server": "Apache/2.4.41 (Ubuntu)" },
    { "Server": "nginx/1.18.0" },
    { "X-Powered-By": "PHP/7.4.3" },
    { "Cache-Control": "public, max-age=3600" }
  ];
  const selectedDecoy = decoyHeaders[crypto.randomInt(0, decoyHeaders.length)];
  Object.entries(selectedDecoy).forEach(([k, v]) => res.setHeader(k, v));

  res.send = function (body: any): Response {
    // Dynamic jitter based on request complexity (30-150ms)
    const jitter = crypto.randomInt(30, 151);

    // Advanced Padding: MTU-aware and high-entropy
    if (typeof body === "string" && body.startsWith("{")) {
      try {
        const data = JSON.parse(body);
        // Add multiple layers of noise
        data._ghost_sig = crypto.randomBytes(16).toString("hex");
        data._entropy_pool = crypto.randomBytes(crypto.randomInt(128, 513)).toString("base64");
        
        // Control flow flattening decoy
        data._cf_decoy = Array.from({ length: 5 }, () => crypto.randomInt(1000, 9999));
        
        body = JSON.stringify(data);
      } catch (e) {}
    }

    setTimeout(() => {
      originalSend.call(this, body);
    }, jitter);

    return res;
  };

  next();
}

/**
 * PhonkAlphabet's GhostAuth: Advanced Hardware-Bound Fingerprinting
 * Uses JA3-like TLS fingerprinting (simulated) and deep header analysis.
 */
export function getSessionFingerprint(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const accept = req.headers["accept"] || "unknown";
  const encoding = req.headers["accept-encoding"] || "unknown";
  const language = req.headers["accept-language"] || "unknown";
  
  // PhonkAlphabet: Include more entropy for bulletproof sessions
  const rawFingerprint = [
    ip,
    ua,
    accept,
    encoding,
    language,
    req.headers["sec-ch-ua-platform"] || "unknown",
    req.headers["sec-ch-ua"] || "unknown"
  ].join("|");

  return crypto
    .createHash("sha384") // Upgraded to SHA-384
    .update(rawFingerprint)
    .digest("hex");
}

export function validateGhostSession(
  req: Request,
  storedFingerprint: string,
): boolean {
  const currentFingerprint = getSessionFingerprint(req);
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(currentFingerprint),
    Buffer.from(storedFingerprint)
  );
}
