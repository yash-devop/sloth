import { config } from "dotenv";
import { z } from "zod";
import { resolveEnvFile } from "./resolve-env-file";

config({ path: await resolveEnvFile() });
const workerEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export const workerEnv = workerEnvSchema.parse(process.env);
