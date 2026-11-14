import type { Prisma } from "@repo/db";

export type AccountType = Pick<
  Prisma.GmailAccount,
  "id" | "email" | "status" | "createdAt" | "lastEmailSyncAt"
>;
