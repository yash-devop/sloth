import { z } from "zod";

const workerEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});

export const workerEnv = workerEnvSchema.parse(process.env);
