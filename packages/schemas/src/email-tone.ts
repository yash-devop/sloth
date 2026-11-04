import z from "zod";

export const emailToneSchema = z
  .enum(["PROFESSIONAL", "FRIENDLY", "FORMAL", "CONCISE", "NONE"])
  .default("FORMAL");
