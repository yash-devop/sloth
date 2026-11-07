import { prisma } from "@repo/db";
import { serverEnv } from "@repo/env/server-env";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { allowedOrigins } from "../cors";
import { sendEmail } from "../mail";
import { EMAIL_EXPIRES_IN } from "../mail/";
import { verificationEmail, withFrontendCallback } from "../mail/template";

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
    },
    github: {
      clientId: serverEnv.GITHUB_CLIENT_ID,
      clientSecret: serverEnv.GITHUB_API_KEY,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github"],
      requireLocalEmailVerified: true,
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
});
