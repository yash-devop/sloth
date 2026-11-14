import { prisma } from "@repo/db";
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
};
