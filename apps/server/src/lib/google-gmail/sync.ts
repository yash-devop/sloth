import { prisma } from "@repo/db";
import { AppError } from "../../middlewares/error.middleware";
import { isInvalidGrant, markAccountDisconnected } from "./errors";
import { gmailConnect } from "./gmail-connect";
import { parseGmailMessage } from "./parse-gmail-message";
import type { SyncGmailOptions, SyncGmailResult } from "./sync.type";

const MAX_RESULTS = 100;

export const syncGmailMessages = async (
  userId: string,
  {
    gmailAccountId,
    query = "in:inbox",
    maxResults = MAX_RESULTS,
  }: SyncGmailOptions = {},
): Promise<SyncGmailResult> => {
  const { gmailClient, account } = await gmailConnect(userId, gmailAccountId);

  const messageIds: string[] = [];
  let pageToken: string | undefined;

  try {
    do {
      const list = await gmailClient.users.messages.list({
        userId: "me",
        q: query,
        maxResults,
        pageToken,
      });

      for (const message of list.data.messages ?? []) {
        if (message.id && messageIds.length < maxResults) {
          messageIds.push(message.id);
        }
      }

      pageToken = list.data.nextPageToken ?? undefined;
    } while (pageToken && messageIds.length < maxResults);
  } catch (error) {
    if (isInvalidGrant(error)) {
      await markAccountDisconnected(account.id, "invalid_grant");
      throw new AppError(
        "Gmail access was revoked. Reconnect this account.",
        409,
        "CONFLICT",
      );
    }

    throw error;
  }

  let saved = 0;
  let failed = 0;

  for (const id of messageIds) {
    try {
      const message = await gmailClient.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      const parsed = parseGmailMessage(message.data);

      if (!parsed.id) {
        failed += 1;
        continue;
      }

      await prisma.email.upsert({
        where: {
          gmailAccountId_gmailMessageId: {
            gmailAccountId: account.id,
            gmailMessageId: parsed.id,
          },
        },
        create: {
          userId,
          gmailAccountId: account.id,
          gmailMessageId: parsed.id,
          threadId: parsed.threadId || null,
          sender: parsed.from,
          recipients: parsed.to,
          subject: parsed.subject,
          body: parsed.body,
          html: parsed.html,
          snippet: parsed.snippet,
          labels: parsed.labels,
          receivedAt: parsed.receivedAt,
        },
        update: {
          threadId: parsed.threadId || null,
          sender: parsed.from,
          recipients: parsed.to,
          subject: parsed.subject,
          body: parsed.body,
          html: parsed.html,
          snippet: parsed.snippet,
          labels: parsed.labels,
          receivedAt: parsed.receivedAt,
        },
      });

      saved += 1;
    } catch (error) {
      if (isInvalidGrant(error)) {
        await markAccountDisconnected(account.id, "invalid_grant");
        throw new AppError(
          "Gmail access was revoked. Reconnect this account.",
          409,
          "CONFLICT",
        );
      }

      failed += 1;
      console.error(`Failed to sync Gmail message ${id}`, error);
    }
  }

  await prisma.gmailAccount.update({
    where: { id: account.id },
    data: { lastEmailSyncAt: new Date() },
  });

  return { fetched: messageIds.length, saved, failed };
};
