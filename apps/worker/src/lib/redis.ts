import { workerEnv } from "@repo/env/worker-env";
import { Redis } from "ioredis";

export const redisClient = new Redis(workerEnv.REDIS_URL, {
  maxRetriesPerRequest: null,
});
