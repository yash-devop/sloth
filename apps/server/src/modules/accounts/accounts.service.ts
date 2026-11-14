import { prisma } from "@repo/db";
import { AppError } from "../../middlewares/error.middleware";
import type { AccountType } from "./accounts.service.type";

export const accountsService = {
  list: async (userId: string): Promise<AccountType[]> =>
    prisma.gmailAccount.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        status: true,
        lastEmailSyncAt: true,
        createdAt: true,
      },
    }),
  disconnect: async (userId: string, id: string): Promise<{ id: string }> => {
    const account = await prisma.gmailAccount.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        googleAccountId: true,
      },
    });

    if (!account) throw new AppError("Account not found", 404, "NOT_FOUND");

    // Remove the linked Google credentials too; otherwise a later token
    // update can re-create the Gmail account and re-sync the inbox.
    await prisma.$transaction(async (tx) => {
      await tx.account.deleteMany({
        where: {
          userId,
          providerId: "google",
          accountId: account.googleAccountId,
        },
      });

      // Emails and their analysis are removed by the cascade.
      await tx.gmailAccount.delete({ where: { id: account.id } });
    });

    return {
      id: account.id,
    };
  },
};
