import { Request, Response } from "express";
import { okResponse } from "../../lib/http";
import { triageService } from "./triage.service";

export const triageController = {
  classify: async (req: Request, res: Response): Promise<void> => {
    const data = await triageService.classify(req.body);

    okResponse(res, data, "Email triage completed");
  },
};
