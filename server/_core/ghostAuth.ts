import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

/**
 * ShadowProxy: Add jitter and padding to responses to bypass DPI
 */
export function shadowProxyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    // Add random jitter (10-50ms) using crypto for better entropy
    const jitter = crypto.randomInt(10, 51);

    // Add random padding to JSON responses
    if (typeof body === "string" && body.startsWith("{")) {
      try {
        const data = JSON.parse(body);
        data._shadow_padding = crypto
          .randomBytes(crypto.randomInt(32, 129))
          .toString("hex");
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
 * GhostAuth: Hardware-bound session fingerprinting
 */
export function getSessionFingerprint(req: Request): string {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const accept = req.headers["accept-language"] || "unknown";

  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${accept}`)
    .digest("hex");
}

export function validateGhostSession(
  req: Request,
  storedFingerprint: string,
): boolean {
  const currentFingerprint = getSessionFingerprint(req);
  return currentFingerprint === storedFingerprint;
}
