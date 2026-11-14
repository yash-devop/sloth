import { Prisma, prisma } from "@repo/db";
import { EmailListQueryType, EmailSyncType } from "@repo/schemas";
import {
  syncGmailMessages,
  SyncGmailResult,
} from "../../lib/google-gmail/sync";

export const emailService = {
  list: async (
    userId: string,
    { gmailAccountId, limit }: EmailListQueryType,
  ): Promise<Prisma.Email[]> => {
    const emails = await prisma.email.findMany({
      where: {
        userId,
        ...(gmailAccountId ? { gmailAccountId } : {}),
      },
      orderBy: { receivedAt: "desc" },
      take: limit,
    });

    return emails;
  },
  sync: async (
    userId: string,
    { gmailAccountId, query, maxResults }: EmailSyncType,
  ): Promise<SyncGmailResult> =>
    syncGmailMessages(userId, { gmailAccountId, query, maxResults }),
};
