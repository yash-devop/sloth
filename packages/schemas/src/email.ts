import z from "zod";

export const emailInputSchema = z.object({
  sender: z.email("Invalid email"),
  subject: z.string("Invalid subject").min(1).max(50),
  body: z.string(),
  receivedAt: z.coerce.date("Invalid date"),
});

export type EmailInputType = z.infer<typeof emailInputSchema>;
