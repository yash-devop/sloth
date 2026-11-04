import {
  emailClassificationResponseSchema,
  EmailClassificationResponseType,
  EmailInputType,
} from "@repo/schemas";
import { llmService } from "../llm/llm.service";

export const triageService = {
  testResponse: async (emailInput: EmailInputType) => {
    try {
      const res = await llmService.llmOutput(emailInput);

      const parsedRes = JSON.parse(res.data) as EmailClassificationResponseType;
      const normalizedRes = {
        ...parsedRes,
        category: parsedRes.category?.toUpperCase(),
        priority: parsedRes.priority?.toUpperCase(),
        suggestedTone: parsedRes.suggestedTone?.toUpperCase(),
      };
      const data = emailClassificationResponseSchema.parse(normalizedRes);
      return {
        data,
        message: "Email Triage done.",
      };
    } catch (error) {
      throw error;
    }
  },
};
