import z from "zod";

export const emailIdSchema = z.object({
  id: z.string().min(1),
});

export const emailInputSchema = z.object({
  sender: z.email("Invalid email"),
  subject: z.string("Invalid subject").min(1).max(100),
  body: z.string().max(20_000),
  receivedAt: z.coerce.date("Invalid date"),
});

export const emailListQuerySchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const emailSyncSchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  query: z.string().min(1).max(200).optional(),
  maxResults: z.coerce.number().int().min(1).max(500).optional(),
});

export const emailAnalyzeSchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EmailIdType = z.infer<typeof emailIdSchema>;
export type EmailInputType = z.infer<typeof emailInputSchema>;
export type EmailListQueryType = z.infer<typeof emailListQuerySchema>;
export type EmailSyncType = z.infer<typeof emailSyncSchema>;
export type EmailAnalyzeType = z.infer<typeof emailAnalyzeSchema>;
