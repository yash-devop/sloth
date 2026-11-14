import type { Prisma } from "@repo/db";

export type TEmailMessage = {
  id: string;
  threadId: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  html: string | null;
  snippet: string;
  receivedAt: Date;
  labels: string[];
};

export type TEmailSummary = {
  id: string;
  threadId: string | null;
  sender: string;
  subject: string;
  snippet: string | null;
  labels: string[];
  status: Prisma.Email["status"];
  receivedAt: Date;
};

export type TEmailDetail = TEmailSummary & {
  recipients: string[];
  body: string;
  html: string | null;
};
