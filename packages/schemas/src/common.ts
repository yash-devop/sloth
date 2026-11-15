import z from "zod";

export const emailCategorySchema = z.enum([
  "WORK",
  "PERSONAL",
  "FINANCE",
  "PROMOTIONS",
  "SPAM",
  "OTHER",
]);

export type EmailCategory = z.infer<typeof emailCategorySchema>;

export const EMAIL_CATEGORIES = emailCategorySchema.options;

export const EMAIL_CATEGORY_META: Record<
  EmailCategory,
  { label: string; description: string }
> = {
  WORK: {
    label: "Work",
    description: "Job opportunities, clients, meetings, projects",
  },
  PERSONAL: {
    label: "Personal",
    description: "Friends, family, personal conversations",
  },
  FINANCE: {
    label: "Finance",
    description: "Payments, invoices, banking, transactions",
  },
  PROMOTIONS: {
    label: "Promotions",
    description: "Marketing, offers, newsletters",
  },
  SPAM: {
    label: "Spam",
    description: "Suspicious or unsolicited emails",
  },
  OTHER: {
    label: "Other",
    description: "Anything that doesn't fit elsewhere",
  },
};

export const emailPrioritySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
]);

export type EmailPriority = z.infer<typeof emailPrioritySchema>;

export const EMAIL_PRIORITIES = emailPrioritySchema.options;

export const EMAIL_PRIORITY_META: Record<
  EmailPriority,
  { label: string; description: string }
> = {
  LOW: {
    label: "Low",
    description: "No action needed soon; informational or low-value",
  },
  MEDIUM: {
    label: "Medium",
    description: "Worth reading and handling within a few days",
  },
  HIGH: {
    label: "High",
    description: "Important and time-sensitive; respond today",
  },
  URGENT: {
    label: "Urgent",
    description: "Requires immediate attention; deadlines or blockers",
  },
};

export const emailToneSchema = z.enum([
  "PROFESSIONAL",
  "FRIENDLY",
  "FORMAL",
  "CONCISE",
  "NONE",
]);

export type EmailTone = z.infer<typeof emailToneSchema>;

export const emailStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export type EmailStatus = z.infer<typeof emailStatusSchema>;

/**
 * Query strings arrive as text, so `"false"` must map to `false`.
 * `z.coerce.boolean()` would turn `"false"` into `true`, hence the transform.
 */
export const emailBooleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export type EmailBooleanQueryType = z.infer<typeof emailBooleanQuerySchema>;
