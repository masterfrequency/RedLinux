import crypto from "node:crypto";
import type { Request, Response } from "express";
import type { InsertUser, User } from "../../drizzle/schema";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const";
import { getUserByOpenId, upsertUser } from "../db";
import { ENV } from "./env";

const SESSION_TTL_MS = Math.min(ONE_YEAR_MS, 1000 * 60 * 60 * 8);
const SESSION_VERSION = 1;

type OperatorSessionClaims = {
  version: typeof SESSION_VERSION;
  openId: string;
  role: "user" | "admin";
  name: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
};

export type LoginResult = {
  user: User;
  expiresAt: string;
};

function base64UrlEncode(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSessionSecret(): string {
  const secret = ENV.cookieSecret;
  if (!secret || secret.length < 32) {
    if (ENV.isProduction) {
      throw new Error(
        "JWT_SECRET must be configured before operator sessions can be issued in production.",
      );
    }
    return "redlinux-development-session-secret-change-before-production";
  }
  return secret;
}

function signPayload(payload: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function timingSafeEqualString(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function buildVirtualOperator(
  claims: Pick<OperatorSessionClaims, "openId" | "role" | "name" | "email">,
): User {
  const now = new Date();
  return {
    id: 1,
    openId: claims.openId,
    name: claims.name,
    email: claims.email,
    loginMethod: "operator-key",
    role: claims.role,
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
  } as User;
}

function getOperatorIdentity(): Pick<
  OperatorSessionClaims,
  "openId" | "role" | "name" | "email"
> {
  return {
    openId:
      ENV.ownerOpenId ||
      process.env.REDLINUX_OPERATOR_OPEN_ID ||
      "redlinux-operator",
    role: "admin",
    name: process.env.REDLINUX_OPERATOR_NAME || "RedLinux Operator",
    email: process.env.REDLINUX_OPERATOR_EMAIL || "operator@redlinux.local",
  };
}

function createSessionToken(claims: OperatorSessionClaims): string {
  const payload = base64UrlEncode(JSON.stringify(claims));
  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token: string): OperatorSessionClaims | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  if (!timingSafeEqualString(signature, expected)) return null;

  try {
    const claims = JSON.parse(
      base64UrlDecode(payload),
    ) as OperatorSessionClaims;
    if (claims.version !== SESSION_VERSION) return null;
    if (!claims.openId || !claims.expiresAt) return null;
    if (claims.expiresAt <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

function getOperatorKey(): string {
  return process.env.REDLINUX_OPERATOR_KEY || process.env.OPERATOR_KEY || "";
}

export function isOperatorLoginConfigured(): boolean {
  return getOperatorKey().length >= 16;
}

export async function authenticateOperator(
  operatorKey: string,
  res: Response,
): Promise<LoginResult> {
  const configuredKey = getOperatorKey();
  if (!configuredKey) {
    throw new Error(
      "REDLINUX_OPERATOR_KEY is not configured. Set a high-entropy operator key before logging in.",
    );
  }
  if (configuredKey.length < 16) {
    throw new Error(
      "REDLINUX_OPERATOR_KEY must be at least 16 characters long.",
    );
  }
  if (!timingSafeEqualString(operatorKey, configuredKey)) {
    throw new Error("Invalid operator key.");
  }

  const identity = getOperatorIdentity();
  const insertUser: InsertUser = {
    openId: identity.openId,
    name: identity.name,
    email: identity.email,
    loginMethod: "operator-key",
    role: identity.role,
    lastSignedIn: new Date(),
  };

  await upsertUser(insertUser);
  const persistedUser = await getUserByOpenId(identity.openId);
  const user = persistedUser ?? buildVirtualOperator(identity);
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_TTL_MS;

  const token = createSessionToken({
    version: SESSION_VERSION,
    openId: identity.openId,
    role: user.role,
    name: user.name || identity.name,
    email: user.email || identity.email,
    issuedAt,
    expiresAt,
  });

  const cookieValue = `${COOKIE_NAME}=${token}; Path=/; ${ENV.isProduction ? "Secure; " : ""}HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
  res.setHeader("Set-Cookie", cookieValue);

  return { user, expiresAt: new Date(expiresAt).toISOString() };
}

export async function resolveOperatorSession(
  req: Request,
): Promise<User | null> {
  const cookieHeader = req.headers.cookie || "";
  const cookies: Record<string, string> = {};
  cookieHeader.split(";").forEach((cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) cookies[name] = decodeURIComponent(value);
  });

  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  const claims = verifySessionToken(token);
  if (!claims) return null;

  const user = await getUserByOpenId(claims.openId);
  return user ?? buildVirtualOperator(claims);
}
