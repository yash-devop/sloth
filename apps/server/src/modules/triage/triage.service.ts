import { serverEnv } from "@repo/env/server-env";
import { AppError } from "../../middlewares/error.middleware";
import { GoogleGenAI } from "@google/genai";
export const triageService = {
  test: async () => {
    try {
      const gemini = new GoogleGenAI({ apiKey: serverEnv.GEMINI_API_KEY });

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: "What is 1+2 ?",
      });

      console.log("response", response.text);

      return response.text;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("triage failed", 400, "FAILED");
    }
  },
};
