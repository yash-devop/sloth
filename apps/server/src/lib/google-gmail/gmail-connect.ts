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

    const accessExpired =
      userGmailAccount.accessTokenExpiresAt !== null &&
      userGmailAccount.accessTokenExpiresAt.getTime() <= Date.now();

    if (
      userGmailAccount.status === "DISCONNECTED" ||
      (accessExpired && !userGmailAccount.refreshToken)
    ) {
      if (userGmailAccount.status !== "DISCONNECTED") {
        await prisma.gmailAccount.update({
          where: { id: userGmailAccount.id },
          data: {
            status: "DISCONNECTED",
            disconnectedAt: new Date(),
            lastError: "access_expired",
          },
        });
      }

      throw new AppError(
        "Gmail access expired. Reconnect this account.",
        409,
        "CONFLICT",
      );
    }

    client.setCredentials({
      access_token: userGmailAccount.accessToken,
      refresh_token: userGmailAccount.refreshToken,
      expiry_date: userGmailAccount.accessTokenExpiresAt?.getTime(),
    });

    // google-auth-library refreshes in memory; persist the new tokens so the
    // next request does not depend on a refresh happening again.
    client.on("tokens", (tokens) => {
      const data: {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpiresAt?: Date;
      } = {};

      if (tokens.access_token) data.accessToken = tokens.access_token;
      if (tokens.refresh_token) data.refreshToken = tokens.refresh_token;
      if (tokens.expiry_date) {
        data.accessTokenExpiresAt = new Date(tokens.expiry_date);
      }

      if (Object.keys(data).length === 0) return;

      void prisma.gmailAccount
        .update({ where: { id: userGmailAccount.id }, data })
        .catch((error: unknown) => {
          console.error("Failed to persist refreshed Gmail token", error);
        });
    });

    const gmailClient = google.gmail({ version: "v1", auth: client });

    return { gmailClient, account: userGmailAccount };
  } catch (error) {
    if (error instanceof AppError) throw error;

    throw new AppError("Something went wrong", 500, "INTERNAL_ERROR", error);
  }
};
