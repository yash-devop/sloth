import type z from "zod";
import type { awsEnvSchema } from "./aws";

export type AwsEnv = z.infer<typeof awsEnvSchema>;
