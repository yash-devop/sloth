export type SyncGmailOptions = {
  gmailAccountId?: string;
  query?: string;
  maxResults?: number;
};

export type SyncGmailResult = {
  fetched: number;
  saved: number;
  failed: number;
};
