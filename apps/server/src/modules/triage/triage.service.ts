import {
  emailClassificationResponseSchema,
  EmailClassificationResponseType,
  EmailInputType,
} from "@repo/schemas";
import { AppError } from "../../middlewares/error.middleware";
import { llmService } from "../llm/llm.service";

const toUpperEnum = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim().toUpperCase() : undefined;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalize = (raw: Record<string, unknown>) => ({
  ...raw,
  category: toUpperEnum(raw.category),
  priority: toUpperEnum(raw.priority),
  suggestedTone: toUpperEnum(raw.suggestedTone) ?? "NONE",
  actionItems: Array.isArray(raw.actionItems) ? raw.actionItems : [],
  deadlines: Array.isArray(raw.deadlines) ? raw.deadlines : [],
});

const parseModelJson = (raw: string): unknown => {
  const cleaned = raw
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new AppError("Model returned invalid JSON", 502, "FAILED");
  }
};

export const triageService = {
  classify: async (
    emailInput: EmailInputType,
  ): Promise<EmailClassificationResponseType> => {
    const raw = await llmService.llmOutput(emailInput);
    const parsed = parseModelJson(raw);

    return emailClassificationResponseSchema.parse(
      normalize(isRecord(parsed) ? parsed : {}),
    );
  },
};
