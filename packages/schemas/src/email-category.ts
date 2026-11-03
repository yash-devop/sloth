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
