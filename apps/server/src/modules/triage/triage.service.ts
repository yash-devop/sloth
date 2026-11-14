import { AiError, classifyEmail } from "@repo/ai";
import { serverEnv } from "@repo/env/server-env";
import {
  EmailClassificationResponseType,
  EmailInputType,
} from "@repo/schemas";
import { AppError } from "../../middlewares/error.middleware";

export const triageService = {
  classify: async (
    emailInput: EmailInputType,
  ): Promise<EmailClassificationResponseType> => {
    try {
      return await classifyEmail(emailInput, {
        apiKey: serverEnv.GEMINI_API_KEY,
        model: serverEnv.GEMINI_MODEL,
      });
    } catch (error) {
      if (error instanceof AiError) {
        throw new AppError(error.message, 502, "FAILED", { cause: error });
      }

      throw error;
    }
  },
};
