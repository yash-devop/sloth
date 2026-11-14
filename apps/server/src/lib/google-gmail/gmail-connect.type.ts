import type { Prisma } from "@repo/db";
import type { gmail_v1 } from "googleapis";

export type GmailConnection = {
  gmailClient: gmail_v1.Gmail;
  account: Prisma.GmailAccount;
};
