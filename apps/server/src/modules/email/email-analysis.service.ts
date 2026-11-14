import { prisma } from "@repo/db";
import { enqueueEmailAnalysis } from "../../lib/queue/analysis.queue";

const BATCH_SIZE = 100;

export const emailAnalysisService = {
  enqueuePending: async (
    userId: string,
    {
      gmailAccountId,
      limit = BATCH_SIZE,
    }: { gmailAccountId?: string; limit?: number } = {},
  ): Promise<{ queued: number }> => {
    const pending = await prisma.email.findMany({
      where: {
        userId,
        status: "PENDING",
        ...(gmailAccountId ? { gmailAccountId } : {}),
      },
      orderBy: { receivedAt: "desc" },
      take: limit,
      select: {
        id: true,
        gmailAccountId: true,
      },
    });

    const queued = await enqueueEmailAnalysis(
      pending.map((email) => ({
        emailId: email.id,
        userId,
        gmailAccountId: email.gmailAccountId,
      })),
    );

    return { queued };
  },
};
