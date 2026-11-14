import { Prisma, prisma } from "@repo/db";
import { serverEnv } from "@repo/env/server-env";
import { gmail_v1, google } from "googleapis";
import { AppError } from "../../middlewares/error.middleware";

type GmailConnection = {
  gmailClient: gmail_v1.Gmail;
  account: Prisma.GmailAccount;
};

export const gmailConnect = async (
  userId: string,
  gmailAccountId?: string,
): Promise<GmailConnection> => {
  try {
    const client = new google.auth.OAuth2({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_API_KEY,
    });

    const userGmailAccount = await prisma.gmailAccount.findFirst({
      where: {
        userId,
        ...(gmailAccountId ? { id: gmailAccountId } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    if (!userGmailAccount) {
      throw new AppError("No connected Gmail account found", 404, "NOT_FOUND");
    }

    client.setCredentials({
      access_token: userGmailAccount.accessToken,
      refresh_token: userGmailAccount.refreshToken,
    });

    const gmailClient = google.gmail({ version: "v1", auth: client });

    return { gmailClient, account: userGmailAccount };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError("Something went wrong", 500, "INTERNAL_ERROR", error);
  }
};
