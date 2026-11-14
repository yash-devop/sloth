import { Prisma, prisma } from "@repo/db";

type AccountType = Pick<
  Prisma.GmailAccount,
  "id" | "email" | "status" | "createdAt" | "lastEmailSyncAt"
>;

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
