import z from "zod";

export const accountIdSchema = z.object({
  id: z.string().min(1),
});

export type AccountIdType = z.infer<typeof accountIdSchema>;
