import { EmailSyncType } from "@repo/schemas";
import { syncGmailMessages } from "../../lib/google-gmail/sync";
import type { SyncGmailResult } from "../../lib/google-gmail/sync.type";
import { emailAnalysisService } from "./email-analysis.service";

const INITIAL_QUERY = "in:inbox newer_than:90d";
const INITIAL_MAX_RESULTS = 200;

const syncing = new Set<string>();

export const emailSyncService = {
  startInitial: (userId: string, gmailAccountId: string): void => {
    if (syncing.has(gmailAccountId)) return;

    syncing.add(gmailAccountId);

    void syncGmailMessages(userId, {
      gmailAccountId,
      query: INITIAL_QUERY,
      maxResults: INITIAL_MAX_RESULTS,
    })
      .then(() =>
        emailAnalysisService.enqueuePending(userId, { gmailAccountId }),
      )
      .catch((error: unknown) => {
        console.error("Initial Gmail sync failed", error);
      })
      .finally(() => {
        syncing.delete(gmailAccountId);
      });
  },

  syncNow: async (
    userId: string,
    input: EmailSyncType,
  ): Promise<SyncGmailResult> => {
    const result = await syncGmailMessages(userId, input);

    void emailAnalysisService
      .enqueuePending(userId, { gmailAccountId: input.gmailAccountId })
      .catch((error: unknown) => {
        console.error("Failed to enqueue email analysis", error);
      });

    return result;
  },
};
