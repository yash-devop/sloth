import { prisma } from "@repo/db";
import { EmailListQueryType, EmailSyncType } from "@repo/schemas";
import {
  syncGmailMessages,
  SyncGmailResult,
} from "../../lib/google-gmail/sync";
import { AppError } from "../../middlewares/error.middleware";
import { TEmailDetail, TEmailSummary } from "../../types/email.type";

export const emailService = {
  list: async (
    userId: string,
    { gmailAccountId, limit }: EmailListQueryType,
  ): Promise<TEmailSummary[]> => {
    const emails = await prisma.email.findMany({
      where: {
        userId,
        ...(gmailAccountId ? { gmailAccountId } : {}),
      },
      orderBy: { receivedAt: "desc" },
      take: limit,
      select: {
        id: true,
        sender: true,
        snippet: true,
        threadId: true,
        subject: true,
        labels: true,
        status: true,
        receivedAt: true,
      },
    });

    return emails;
  },

  getEmail: async (userId: string, id: string): Promise<TEmailDetail> => {
    const email = await prisma.email.findFirst({
      where: { id, userId },
      select: {
        id: true,
        threadId: true,
        sender: true,
        recipients: true,
        subject: true,
        body: true,
        html: true,
        snippet: true,
        labels: true,
        status: true,
        receivedAt: true,
      },
    });

    if (!email) {
      throw new AppError("Email not found", 404, "NOT_FOUND");
    }

    return email;
  },

  sync: async (
    userId: string,
    { gmailAccountId, query, maxResults }: EmailSyncType,
  ): Promise<SyncGmailResult> =>
    syncGmailMessages(userId, { gmailAccountId, query, maxResults }),
};
