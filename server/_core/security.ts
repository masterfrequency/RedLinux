import { getDb } from "../db";
import { operatorSessionLogs } from "../../drizzle/schema";
import crypto from "node:crypto";
export async function logAudit(
  engagementId: number,
  action: string,
  details: any,
  userId: number = 1,
) {
  const db = await getDb();
  if (!db) return;
  const logEntry = {
    engagementId,
    userId,
    module: "security",
    action,
    details: JSON.stringify(details),
    status: "success" as const,
    timestamp: new Date(),
  };
  const hmac = crypto
    .createHmac("sha256", process.env.AUDIT_SECRET || "audit-secret-key")
    .update(JSON.stringify(logEntry))
    .digest("hex");
  await db.insert(operatorSessionLogs).values({
    ...logEntry,
    details: JSON.stringify({ ...details, _hmac: hmac }),
  });
}
export type UserRole = "admin" | "operator" | "viewer";
export function checkPermission(
  userRole: UserRole,
  requiredRole: UserRole,
): boolean {
  const roles: UserRole[] = ["viewer", "operator", "admin"];
  return roles.indexOf(userRole) >= roles.indexOf(requiredRole);
}
