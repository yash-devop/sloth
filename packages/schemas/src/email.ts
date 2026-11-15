import z from "zod";
import {
  emailBooleanQuerySchema,
  emailCategorySchema,
  emailPrioritySchema,
  emailStatusSchema,
  emailToneSchema,
} from "./common";

export const emailIdSchema = z.object({
  id: z.string().min(1),
});

export type EmailIdType = z.infer<typeof emailIdSchema>;

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
  q: z.string().trim().min(1).max(200).optional(),
  category: emailCategorySchema.optional(),
  priority: emailPrioritySchema.optional(),
  requiresReply: emailBooleanQuerySchema.optional(),
  status: emailStatusSchema.optional(),
});

export type EmailListQueryType = z.infer<typeof emailListQuerySchema>;

export const emailThreadParamsSchema = z.object({
  threadId: z.string().min(1),
});

export type EmailThreadParamsType = z.infer<typeof emailThreadParamsSchema>;

export const emailInboxSummaryQuerySchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
});

export type EmailInboxSummaryQueryType = z.infer<
  typeof emailInboxSummaryQuerySchema
>;

export const emailSyncSchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  query: z.string().min(1).max(200).optional(),
  maxResults: z.coerce.number().int().min(1).max(500).optional(),
});

export type EmailSyncType = z.infer<typeof emailSyncSchema>;

export const emailAnalyzeSchema = z.object({
  gmailAccountId: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type EmailAnalyzeType = z.infer<typeof emailAnalyzeSchema>;

export const emailClassificationResponseSchema = z.object({
  category: emailCategorySchema,
  priority: emailPrioritySchema,
  requiresReply: z.boolean(),
  intent: z.string(),
  summary: z.string(),
  actionItems: z.string().array(),
  deadlines: z.string().array(),
  suggestedTone: emailToneSchema,
  replyDraft: z.string().nullable(),
});

export type EmailClassificationResponseType = z.infer<
  typeof emailClassificationResponseSchema
>;
