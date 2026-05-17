import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Unique identifier for the user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Engagements: Red team operations scoped to a specific target
 * Each engagement is a container for all related data (modules, findings, loot)
 */
export const engagements = mysqlTable("engagements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  target: text("target"),
  status: mysqlEnum("status", ["active", "paused", "completed", "archived"])
    .default("active")
    .notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Engagement = typeof engagements.$inferSelect;
export type InsertEngagement = typeof engagements.$inferInsert;

/**
 * Aether Recon: OSINT and intelligence gathering findings
 */
export const aetherReconFindings = mysqlTable("aether_recon_findings", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  targetType: varchar("targetType", { length: 64 }).notNull(), // person, company, email, domain, etc.
  targetValue: text("targetValue").notNull(),
  findingType: varchar("findingType", { length: 64 }).notNull(), // credential, social_link, email, phone, etc.
  findingData: text("findingData").notNull(), // JSON
  source: varchar("source", { length: 255 }),
  confidence: int("confidence").default(50), // 0-100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AetherReconFinding = typeof aetherReconFindings.$inferSelect;
export type InsertAetherReconFinding = typeof aetherReconFindings.$inferInsert;

/**
 * Specter Evasion: Payload signatures and EDR bypass tracking
 */
export const specterEvasionSignatures = mysqlTable(
  "specter_evasion_signatures",
  {
    id: int("id").autoincrement().primaryKey(),
    engagementId: int("engagementId").notNull(),
    payloadName: varchar("payloadName", { length: 255 }).notNull(),
    originalHash: varchar("originalHash", { length: 255 }),
    polymorphicHash: varchar("polymorphicHash", { length: 255 }),
    edrBypassStatus: mysqlEnum("edrBypassStatus", [
      "unknown",
      "bypassed",
      "detected",
      "flagged",
    ])
      .default("unknown")
      .notNull(),
    lastTestedAt: timestamp("lastTestedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
);

export type SpecterEvasionSignature =
  typeof specterEvasionSignatures.$inferSelect;
export type InsertSpecterEvasionSignature =
  typeof specterEvasionSignatures.$inferInsert;

/**
 * Nexus Exploit: Vulnerability findings and exploitation logs
 */
export const nexusExploitFindings = mysqlTable("nexus_exploit_findings", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  cveId: varchar("cveId", { length: 64 }),
  vulnerabilityName: varchar("vulnerabilityName", { length: 255 }).notNull(),
  affectedTarget: text("affectedTarget"),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low", "info"])
    .default("medium")
    .notNull(),
  exploitStatus: mysqlEnum("exploitStatus", [
    "discovered",
    "attempted",
    "successful",
    "failed",
  ])
    .default("discovered")
    .notNull(),
  heuristicScore: int("heuristicScore").default(0),
  executionLog: text("executionLog"), // JSON array of execution attempts
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NexusExploitFinding = typeof nexusExploitFindings.$inferSelect;
export type InsertNexusExploitFinding =
  typeof nexusExploitFindings.$inferInsert;

/**
 * Ghost C2: Command and control channel management
 */
export const ghostC2Channels = mysqlTable("ghost_c2_channels", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  channelName: varchar("channelName", { length: 255 }).notNull(),
  channelType: mysqlEnum("channelType", [
    "https",
    "dns",
    "icmp",
    "steganographic",
    "custom",
  ])
    .default("https")
    .notNull(),
  encryptionMethod: varchar("encryptionMethod", { length: 64 }).default(
    "aes256",
  ),
  heartbeatInterval: int("heartbeatInterval").default(3600), // seconds
  lastHeartbeat: timestamp("lastHeartbeat"),
  status: mysqlEnum("status", ["active", "inactive", "compromised", "killed"])
    .default("inactive")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GhostC2Channel = typeof ghostC2Channels.$inferSelect;
export type InsertGhostC2Channel = typeof ghostC2Channels.$inferInsert;

/**
 * Shadow Exfil: Data exfiltration tracking
 */
export const shadowExfilTransfers = mysqlTable("shadow_exfil_transfers", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  transferName: varchar("transferName", { length: 255 }).notNull(),
  dataType: varchar("dataType", { length: 64 }).notNull(), // files, credentials, database, etc.
  totalSize: int("totalSize").default(0), // bytes
  transferredSize: int("transferredSize").default(0), // bytes
  chunkCount: int("chunkCount").default(0),
  completedChunks: int("completedChunks").default(0),
  progress: int("progress").default(0),
  status: mysqlEnum("status", [
    "pending",
    "in_progress",
    "completed",
    "failed",
    "terminated",
  ])
    .default("pending")
    .notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShadowExfilTransfer = typeof shadowExfilTransfers.$inferSelect;
export type InsertShadowExfilTransfer =
  typeof shadowExfilTransfers.$inferInsert;

/**
 * Loot Vault: Encrypted storage for captured data
 */
export const lootVaultItems = mysqlTable("loot_vault_items", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  itemType: mysqlEnum("itemType", [
    "hash",
    "credential",
    "document",
    "key",
    "token",
    "other",
  ])
    .default("other")
    .notNull(),
  category: varchar("category", { length: 64 }).notNull(), // e.g., "domain_admin", "database_creds", "ssh_keys"
  name: varchar("name", { length: 255 }).notNull(),
  encryptedData: text("encryptedData").notNull(), // Encrypted JSON
  dataHash: varchar("dataHash", { length: 255 }), // For deduplication
  source: varchar("source", { length: 255 }), // Where it came from
  tags: text("tags"), // JSON array of tags for searching
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LootVaultItem = typeof lootVaultItems.$inferSelect;
export type InsertLootVaultItem = typeof lootVaultItems.$inferInsert;

/**
 * Operator Session Log: Activity tracking per engagement
 */
export const operatorSessionLogs = mysqlTable("operator_session_logs", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  userId: int("userId").notNull(),
  module: varchar("module", { length: 64 }).notNull(), // aether, specter, nexus, ghost, shadow, loot, settings
  action: varchar("action", { length: 255 }).notNull(), // create, update, delete, execute, etc.
  details: text("details"), // JSON
  status: mysqlEnum("status", ["success", "failure", "pending"])
    .default("success")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OperatorSessionLog = typeof operatorSessionLogs.$inferSelect;
export type InsertOperatorSessionLog = typeof operatorSessionLogs.$inferInsert;

/**
 * Operator Settings: Per-user configuration
 */
export const operatorSettings = mysqlTable("operator_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  theme: mysqlEnum("theme", ["dark", "light"]).default("dark").notNull(),
  moduleConfig: text("moduleConfig"), // JSON with per-module settings
  apiKeys: text("apiKeys"), // Encrypted JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OperatorSetting = typeof operatorSettings.$inferSelect;
export type InsertOperatorSetting = typeof operatorSettings.$inferInsert;

/**
 * Network Infiltrator: Network scanning and topology data
 */
export const networkScans = mysqlTable("network_scans", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  target: text("target").notNull(),
  scanType: varchar("scanType", { length: 64 }).default("port_scan"),
  results: text("results"), // JSON array of scan results
  status: mysqlEnum("status", [
    "pending",
    "queued",
    "running",
    "completed",
    "failed",
  ])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NetworkScan = typeof networkScans.$inferSelect;
export type InsertNetworkScan = typeof networkScans.$inferInsert;

/**
 * Credential Harvester: Phishing and credential interception logs
 */
export const harvestedCredentials = mysqlTable("harvested_credentials", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  source: varchar("source", { length: 255 }).notNull(), // e.g., "phish-01", "listener-01"
  username: varchar("username", { length: 255 }),
  password: text("password"),
  extraData: text("extraData"), // JSON
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
});

export type HarvestedCredential = typeof harvestedCredentials.$inferSelect;
export type InsertHarvestedCredential =
  typeof harvestedCredentials.$inferInsert;

/**
 * OSINT Nexus: Automated intelligence synthesis from external providers
 */
export const osintNexusFindings = mysqlTable("osint_nexus_findings", {
  id: int("id").autoincrement().primaryKey(),
  engagementId: int("engagementId").notNull(),
  provider: varchar("provider", { length: 64 }).notNull(), // shodan, censys, greynoise, etc.
  target: varchar("target", { length: 255 }).notNull(),
  findingType: varchar("findingType", { length: 64 }).notNull(), // host_info, cert_info, noise_info, etc.
  data: text("data").notNull(), // JSON
  rawResponse: text("rawResponse"), // Full JSON response for debugging
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsintNexusFinding = typeof osintNexusFindings.$inferSelect;
export type InsertOsintNexusFinding = typeof osintNexusFindings.$inferInsert;
