import { z } from "zod";

export const awsEnvSchema = z.object({
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
});
