import z from "zod";
import { emailCategorySchema } from "./email-category";
import { emailPrioritySchema } from "./email-priority";
import { emailToneSchema } from "./email-tone";

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
