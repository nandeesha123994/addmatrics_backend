const { z } = require("zod");

const configSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),

  JWT_ACCESS_SECRET: z.string().min(32),

  TOKEN_HASH_SECRET: z.string().min(32),

  TOTP_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "Must be a 32-byte hexadecimal key"),
});

function loadConfig() {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment configuration:");

    for (const issue of result.error.issues) {
      console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    }

    throw new Error("Environment configuration is invalid");
  }

  return result.data;
}

module.exports = { loadConfig };
