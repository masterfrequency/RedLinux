import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  SHODAN_API_KEY: z.string().optional(),
  CENSYS_ID: z.string().optional(),
  CENSYS_SECRET: z.string().optional(),
  GREYNOISE_API_KEY: z.string().optional(),
  BUILT_IN_FORGE_API_URL: z.string().optional(),
  BUILT_IN_FORGE_API_KEY: z.string().optional(),
  OWNER_OPEN_ID: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);
const nodeEnv =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";

if (!parsedEnv.success) {
  const formattedError = parsedEnv.error.format();
  if (nodeEnv === "production") {
    throw new Error(
      `Invalid production environment configuration: ${JSON.stringify(formattedError)}`,
    );
  }
  console.warn(
    "[Environment] Using development-safe fallbacks because configuration is incomplete:",
    formattedError,
  );
}

const env = parsedEnv.success
  ? parsedEnv.data
  : {
      JWT_SECRET:
        process.env.JWT_SECRET ||
        "redlinux-development-secret-change-before-production-32-bytes",
      DATABASE_URL: process.env.DATABASE_URL || "",
      NODE_ENV: nodeEnv,
      SHODAN_API_KEY: process.env.SHODAN_API_KEY,
      CENSYS_ID: process.env.CENSYS_ID,
      CENSYS_SECRET: process.env.CENSYS_SECRET,
      GREYNOISE_API_KEY: process.env.GREYNOISE_API_KEY,
      BUILT_IN_FORGE_API_URL: process.env.BUILT_IN_FORGE_API_URL,
      BUILT_IN_FORGE_API_KEY: process.env.BUILT_IN_FORGE_API_KEY,
      OWNER_OPEN_ID: process.env.OWNER_OPEN_ID,
    };

export const ENV = {
  cookieSecret: env.JWT_SECRET,
  databaseUrl: env.DATABASE_URL,
  isProduction: env.NODE_ENV === "production",
  shodanApiKey: env.SHODAN_API_KEY ?? "",
  censysId: env.CENSYS_ID ?? "",
  censysSecret: env.CENSYS_SECRET ?? "",
  greyNoiseApiKey: env.GREYNOISE_API_KEY ?? "",
  forgeApiUrl: env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: env.BUILT_IN_FORGE_API_KEY ?? "",
  ownerOpenId: env.OWNER_OPEN_ID ?? "",
};
