export type GmailSyncAccount = {
  providerId: string;
  userId: string;
  accountId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  scope?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
};
