import { PrismaPg } from "@prisma/adapter-pg";
import { workerEnv } from "@repo/env/worker-env";
import * as Prisma from "./generated/prisma/client";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({ connectionString: workerEnv.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
});

export { Prisma };
