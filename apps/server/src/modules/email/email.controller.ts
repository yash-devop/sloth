import { emailListQuerySchema, EmailSyncType } from "@repo/schemas";
import { Request, Response } from "express";
import { okResponse } from "../../lib/http";
import { emailService } from "./email.service";

export const emailController = {
  getEmails: async (req: Request, res: Response): Promise<void> => {
    const query = emailListQuerySchema.parse(req.query);
    const data = await emailService.list(req.user.id, query);

    okResponse(res, data, "Emails fetched successfully");
  },

  syncEmails: async (
    req: Request<unknown, unknown, EmailSyncType>,
    res: Response,
  ): Promise<void> => {
    const data = await emailService.sync(req.user.id, req.body);

    okResponse(res, data, "Emails synced successfully");
  },
};
