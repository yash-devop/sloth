import { z } from "zod";
import { config } from "dotenv";
import { resolveEnvFile } from "./resolve-env-file";

config({ path: await resolveEnvFile() });
const serverEnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  GEMINI_API_KEY: z.string().min(1),
});

export const serverEnv = serverEnvSchema.parse(process.env);
