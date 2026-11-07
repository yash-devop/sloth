import { serverEnv } from "@repo/env/server-env";

const APP_NAME = "SlothETA";

/**
 * better-auth builds the verification link from its own baseURL (the API), and
 * the `callbackURL` it embeds is relative — so following the link would drop the
 * user on the API's root instead of the app. Repoint it at the web app.
 */
export const withFrontendCallback = (url: string): string => {
  const parsed = new URL(url);
  parsed.searchParams.set(
    "callbackURL",
    `${serverEnv.NEXT_PUBLIC_FRONTEND_URL}/dashboard`,
  );
  return parsed.toString();
};

const layout = (content: string): string => `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f6f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px;">
            <tr><td>
              <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">${APP_NAME}</h1>
              ${content}
              <p style="margin:24px 0 0;font-size:12px;color:#71717a;">
                If you did not create a ${APP_NAME} account, you can safely ignore this email.
              </p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const verificationEmail = (verifyUrl: string) => ({
  subject: `Verify your ${APP_NAME} email address`,
  text: [
    `Welcome to ${APP_NAME}!`,
    "",
    "Confirm your email address to finish setting up your account:",
    verifyUrl,
    "",
    "This link expires in 1 hour.",
    "",
    `If you did not create a ${APP_NAME} account, you can safely ignore this email.`,
  ].join("\n"),
  html: layout(`
    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">
      Welcome to ${APP_NAME}! Confirm your email address to finish setting up your account.
    </p>
    <p style="margin:0 0 8px;">
      <a href="${verifyUrl}"
         style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:500;">
        Verify email address
      </a>
    </p>
    <p style="margin:16px 0 0;font-size:12px;color:#71717a;">
      This link expires in 1 hour. If the button does not work, paste this into your browser:
    </p>
    <p style="margin:6px 0 0;font-size:12px;color:#71717a;word-break:break-all;">
      ${verifyUrl}
    </p>
  `),
});
