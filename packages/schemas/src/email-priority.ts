import z from "zod";

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
