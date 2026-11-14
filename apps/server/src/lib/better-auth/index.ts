import { prisma } from "@repo/db";
import { serverEnv } from "@repo/env/server-env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { allowedOrigins } from "../cors";
import { sendEmail } from "../nodemailer";
import { EMAIL_EXPIRES_IN } from "../nodemailer";
import {
  verificationEmail,
  withFrontendCallback,
} from "../nodemailer/template";

type GmailSyncAccount = {
  providerId: string;
  userId: string;
  accountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  scope?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
};

async function syncGmailAccount(account: GmailSyncAccount) {
  if (account.providerId !== "google") return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: account.userId },
      select: { email: true },
    });

    if (!user) return;

    const tokens = {
      email: user.email,
      accessToken: account.accessToken ?? null,
      refreshToken: account.refreshToken ?? null,
      scope: account.scope ?? null,
      accessTokenExpiresAt: account.accessTokenExpiresAt ?? null,
      refreshTokenExpiresAt: account.refreshTokenExpiresAt ?? null,
    };

    await prisma.gmailAccount.upsert({
      where: { googleAccountId: account.accountId },
      update: tokens,
      create: {
        userId: account.userId,
        googleAccountId: account.accountId,
        ...tokens,
      },
    });
  } catch (error) {
    // Never block the auth flow if mailbox provisioning fails.
    console.error("Failed to sync Gmail account", error);
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_API_KEY,
      accessType: "offline", // it means that google please send refresh token also.
      prompt: "consent",
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly", // visit: https://developers.google.com/workspace/gmail/api/auth/scopes
        "https://www.googleapis.com/auth/gmail.modify",
      ],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: true,
      allowDifferentEmails: true,
    },
  },
  trustedOrigins: allowedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    // Sends on sign-up and on every resend, since better-auth routes both
    // through this one callback.
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, text, html } = verificationEmail(
        withFrontendCallback(url),
      );
      await sendEmail({ to: user.email, subject, text, html });
    },
    // Land the user in the app once the link is clicked.
    autoSignInAfterVerification: true,
    expiresIn: EMAIL_EXPIRES_IN,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: serverEnv.BETTER_AUTH_URL.startsWith("https://")
        ? "none"
        : "lax",
    },
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          await syncGmailAccount(account);
        },
      },
      update: {
        after: async (account) => {
          await syncGmailAccount(account);
        },
      },
    },
  },
});
