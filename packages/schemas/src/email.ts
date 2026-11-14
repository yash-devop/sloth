import z from "zod";

export const emailInputSchema = z.object({
  sender: z.email("Invalid email"),
  subject: z.string("Invalid subject").min(1).max(100),
  body: z.string().max(20_000),
  receivedAt: z.coerce.date("Invalid date"),
});

export type EmailInputType = z.infer<typeof emailInputSchema>;

export const emailListQuerySchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type EmailListQueryType = z.infer<typeof emailListQuerySchema>;

export const emailSyncSchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  query: z.string().min(1).max(200).optional(),
  maxResults: z.coerce.number().int().min(1).max(500).optional(),
});

export type EmailSyncType = z.infer<typeof emailSyncSchema>;
