import { emailInputSchema } from "@repo/schemas";
import { Request, Response } from "express";
import { triageService } from "./triage.service";

export const triageController = {
  testResponse: async (req: Request, res: Response) => {
    try {
      const emailInput = emailInputSchema.parse(req.body);
      const response = await triageService.testResponse(emailInput);

      return res.status(200).json(response);
    } catch (error) {
      throw error;
    }
  },
};
