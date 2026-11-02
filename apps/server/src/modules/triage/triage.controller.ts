import { Request, Response } from "express";
import { triageService } from "./triage.service";

export const triageController = {
  test: async (req: Request, res: Response) => {
    try {
      const res = triageService.test();
      return res;
    } catch (error) {
      throw error;
    }
  },
};
