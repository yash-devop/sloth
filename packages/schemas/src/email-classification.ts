import z from "zod";
import { emailCategorySchema } from "./email-category";
import { emailPrioritySchema } from "./email-priority";

export const emailClassificationResponseSchema = z.object({
  category: emailCategorySchema,
  priority: emailPrioritySchema,
  requiresReply: z.boolean(),
});

export type EmailClassificationResponseType = z.infer<
  typeof emailClassificationResponseSchema
>;
