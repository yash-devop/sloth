import { prisma } from "@repo/db";
import {
  EmailInboxSummaryQueryType,
  EmailListQueryType,
  EmailSyncType,
} from "@repo/schemas";
import { AppError } from "../../middlewares/error.middleware";
import {
  TEmailDetail,
  TEmailSummary,
  TInboxSummary,
} from "../../types/email.type";
import { emailSyncService } from "./email-sync.service";

export const emailService = {
  list: async (
    userId: string,
    {
      gmailAccountId,
      limit,
      category,
      priority,
      q,
      requiresReply,
      status,
    }: EmailListQueryType,
  ): Promise<TEmailSummary[]> => {
    const analysisWhere = {
      ...(category ? { category } : {}),
      ...(priority ? { priority } : {}),
      ...(requiresReply !== undefined ? { requiresReply } : {}),
    };

    const where = {
      userId,
      ...(gmailAccountId ? { gmailAccountId } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: "insensitive" as const } },
              { sender: { contains: q, mode: "insensitive" as const } },
              { snippet: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(Object.keys(analysisWhere).length > 0
        ? { emailAnalysis: { is: analysisWhere } }
        : {}),
    };

    const emails = await prisma.email.findMany({
      where,
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
        emailAnalysis: {
          select: {
            category: true,
            priority: true,
            requiresReply: true,
            summary: true,
            deadlines: true,
          },
        },
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
        emailAnalysis: true,
      },
    });

    if (!email) {
      throw new AppError("Email not found", 404, "NOT_FOUND");
    }

    return email;
  },

  sync: async (userId: string, input: EmailSyncType) => {
    return emailSyncService.syncNow(userId, input);
  },

  summary: async (
    userId: string,
    { gmailAccountId }: EmailInboxSummaryQueryType,
  ): Promise<TInboxSummary> => {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [newCount, importantCount, needsReplyCount, withDeadlinesCount] =
      await Promise.all([
        prisma.email.count({
          where: {
            userId,
            gmailAccountId,
            receivedAt: {
              gte: last24Hours,
            },
          },
        }),
        prisma.email.count({
          where: {
            userId,
            gmailAccountId,
            emailAnalysis: {
              priority: {
                in: ["HIGH", "URGENT"],
              },
            },
          },
        }),
        prisma.email.count({
          where: {
            userId,
            gmailAccountId,
            emailAnalysis: {
              requiresReply: {
                equals: true,
              },
            },
          },
        }),
        prisma.email.count({
          where: {
            userId,
            gmailAccountId,
            emailAnalysis: {
              deadlines: {
                isEmpty: false,
              },
            },
          },
        }),
      ]);

    return {
      new: newCount,
      important: importantCount,
      needsReply: needsReplyCount,
      withDeadlines: withDeadlinesCount,
    };
  },
};
