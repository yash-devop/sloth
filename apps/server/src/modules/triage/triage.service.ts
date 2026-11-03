import {
  emailClassificationResponseSchema,
  EmailInputType,
} from "@repo/schemas";
import { llmService } from "../llm/llm.service";

export const triageService = {
  testResponse: async (emailInput: EmailInputType) => {
    try {
      const res = await llmService.llmOutput(emailInput);
      const parsedRes = emailClassificationResponseSchema.parse(
        JSON.parse(res.data),
      );
      return {
        data: parsedRes,
        message: "Email Triage done.",
      };
    } catch (error) {
      throw error;
    }
  },
};
