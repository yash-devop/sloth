import { Request, Response } from "express";
import { ok } from "../../lib/http";
import { triageService } from "./triage.service";

export const triageController = {
  classify: async (req: Request, res: Response) => {
    const data = await triageService.classify(req.body);

    return ok(res, data, "Email triage completed");
  },
};
