import { PrismaPg } from "@prisma/adapter-pg";
import * as Prisma from "./generated/prisma/client";
import { PrismaClient } from "./generated/prisma/client";
import { serverEnv } from "@repo/env/server-env";

const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
});

export { Prisma };
