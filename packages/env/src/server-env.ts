import { config } from "dotenv";
import { z } from "zod";
import { resolveEnvFile } from "./resolve-env-file";

config({ path: await resolveEnvFile() });
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  GEMINI_API_KEY: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  DATABASE_URL: z.string().url(),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  NEXT_PUBLIC_FRONTEND_URL: z.string().url(),
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_API_KEY: z.string().min(1),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  // GITHUB_CLIENT_ID: z.string().min(1),
  // GITHUB_API_KEY: z.stringx().min(1),
});

export const serverEnv = serverEnvSchema.parse(process.env);
