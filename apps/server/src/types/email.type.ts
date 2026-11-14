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
