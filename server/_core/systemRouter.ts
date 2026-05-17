import { z } from "zod";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./notification";
import {
  adminProcedure,
  publicProcedure,
  router,
  protectedProcedure,
} from "./trpc";
import { getDb } from "../db";
import { operatorSettings } from "../../drizzle/schema";
import { encrypt } from "./crypto";
import { ENV } from "./env";

const apiKeysSchema = z.object({
  shodan: z.string().max(512).default(""),
  censys_id: z.string().max(512).default(""),
  censys_secret: z.string().max(512).default(""),
  greynoise: z.string().max(512).default(""),
  openai: z.string().max(512).default(""),
});

const modelConfigSchema = z.object({
  useLocal: z.boolean(),
  modelPath: z.string().max(512).default(""),
});

const settingsInputSchema = z.object({
  keys: apiKeysSchema,
  modelConfig: modelConfigSchema,
  theme: z.enum(["dark", "light"]).default("dark"),
});

type ApiKeys = z.infer<typeof apiKeysSchema>;

function encryptionKey(): string {
  if (!ENV.cookieSecret || ENV.cookieSecret.length < 32) {
    if (ENV.isProduction)
      throw new Error(
        "JWT_SECRET is required to encrypt operator settings in production.",
      );
    return "redlinux-development-settings-key-change-before-production";
  }
  return ENV.cookieSecret;
}

function maskKey(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 8) return "configured";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

function configuredKeys(keys: ApiKeys) {
  return Object.fromEntries(
    Object.entries(keys).map(([key, value]) => [key, Boolean(value)]),
  );
}

function maskedKeys(keys: ApiKeys) {
  return Object.fromEntries(
    Object.entries(keys).map(([key, value]) => [key, maskKey(value)]),
  );
}

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  saveInitialSetup: protectedProcedure
    .input(settingsInputSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(operatorSettings)
        .where(eq(operatorSettings.userId, ctx.user.id))
        .limit(1);
      const configData = {
        modelConfig: input.modelConfig,
        configuredKeys: configuredKeys(input.keys),
        setupCompleted: true,
        setupTimestamp: new Date().toISOString(),
      };
      const encryptedApiKeys = encrypt(
        JSON.stringify(input.keys),
        encryptionKey(),
      );

      if (existing.length > 0) {
        await db
          .update(operatorSettings)
          .set({
            apiKeys: encryptedApiKeys,
            moduleConfig: JSON.stringify(configData),
            theme: input.theme,
          })
          .where(eq(operatorSettings.userId, ctx.user.id));
      } else {
        await db.insert(operatorSettings).values({
          userId: ctx.user.id,
          apiKeys: encryptedApiKeys,
          moduleConfig: JSON.stringify(configData),
          theme: input.theme,
        });
      }

      return { success: true };
    }),

  getSetupStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { completed: false, hasDatabase: false };

    const settings = await db
      .select()
      .from(operatorSettings)
      .where(eq(operatorSettings.userId, ctx.user.id))
      .limit(1);
    if (settings.length === 0) return { completed: false, hasDatabase: true };

    try {
      const config = JSON.parse(settings[0].moduleConfig || "{}");
      return {
        completed: Boolean(config.setupCompleted),
        hasDatabase: true,
        configuredKeys: config.configuredKeys ?? {},
        theme: settings[0].theme,
        modelConfig: config.modelConfig ?? { useLocal: false, modelPath: "" },
      };
    } catch {
      return { completed: false, hasDatabase: true };
    }
  }),

  getOperatorSettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const settings = await db
      .select()
      .from(operatorSettings)
      .where(eq(operatorSettings.userId, ctx.user.id))
      .limit(1);
    if (settings.length === 0) {
      return {
        theme: "dark" as const,
        configuredKeys: configuredKeys(apiKeysSchema.parse({})),
        maskedKeys: maskedKeys(apiKeysSchema.parse({})),
        modelConfig: { useLocal: false, modelPath: "" },
        setupCompleted: false,
      };
    }

    const config = JSON.parse(settings[0].moduleConfig || "{}");
    const configured = config.configuredKeys ?? {};
    return {
      theme: settings[0].theme,
      configuredKeys: configured,
      maskedKeys: Object.fromEntries(
        Object.keys(apiKeysSchema.shape).map((key) => [
          key,
          configured[key] ? "configured" : "",
        ]),
      ),
      modelConfig: config.modelConfig ?? { useLocal: false, modelPath: "" },
      setupCompleted: Boolean(config.setupCompleted),
    };
  }),
});
