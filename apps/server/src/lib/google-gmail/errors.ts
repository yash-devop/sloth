import { prisma } from "@repo/db";

export const isInvalidGrant = (error: unknown): boolean => {
  const response = (error as { response?: { data?: { error?: string } } })
    .response;

  return response?.data?.error === "invalid_grant";
};

export const markAccountDisconnected = async (
  gmailAccountId: string,
  reason: string,
): Promise<void> => {
  await prisma.gmailAccount.update({
    where: { id: gmailAccountId },
    data: {
      status: "DISCONNECTED",
      disconnectedAt: new Date(),
      lastError: reason,
    },
  });
};
