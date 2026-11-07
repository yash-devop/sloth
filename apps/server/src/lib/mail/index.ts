import { serverEnv } from "@repo/env/server-env";
import nodemailer from "nodemailer";

type MailType = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const GMAIL_SMTP = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
} as const;

class MailingError extends Error {
  constructor(errMessage: string, cause?: unknown) {
    super(errMessage, { cause });

    this.name = "MailingError";
  }
}

export const sendEmail = async (mailOpt: MailType) => {
  const user = serverEnv.SMTP_USER;
  const pass = serverEnv.SMTP_PASS;

  if (!user || !pass) {
    if (serverEnv.NODE_ENV === "production") {
      throw new MailingError(
        "SMTP_USER/SMTP_PASS are not set, so the verification email cannot be sent.",
      );
    }

    const { subject, text, to } = mailOpt;
    console.info(
      [
        "",
        "──────────── email (not sent) ────────────",
        `to:      ${to}`,
        `subject: ${subject}`,
        "",
        text,
        "──────────────────────────────────────────",
        "",
      ].join("\n"),
    );
    return;
  }
  try {
    const transport = nodemailer.createTransport({
      ...GMAIL_SMTP,
      auth: {
        user: serverEnv.SMTP_USER,
        pass: serverEnv.SMTP_PASS,
      },
    });
    await transport.sendMail({
      ...mailOpt,
    });
  } catch (error) {
    throw new MailingError(
      `Gmail SMTP delivery to ${mailOpt.to} failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const EMAIL_EXPIRES_IN = 60 * 60;
