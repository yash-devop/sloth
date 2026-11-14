import {
  emailAnalyzeSchema,
  emailListQuerySchema,
  EmailAnalyzeType,
  EmailSyncType,
  EmailIdType,
  EmailListQueryType,
} from "@repo/schemas";
import { Request, Response } from "express";
import { okResponse } from "../../lib/http";
import { emailAnalysisService } from "./email-analysis.service";
import { emailService } from "./email.service";

export const emailController = {
  getEmails: async (
    req: Request<unknown, unknown, unknown, EmailListQueryType>,
    res: Response,
  ): Promise<void> => {
    const data = await emailService.list(req.user.id, req.query);

    okResponse(res, data, "Emails fetched successfully");
  },

  getEmail: async (
    req: Request<EmailIdType, unknown, unknown>,
    res: Response,
  ): Promise<void> => {
    const data = await emailService.getEmail(req.user.id, req.params.id);

    okResponse(res, data, "Email fetched successfully");
  },

  syncEmails: async (
    req: Request<unknown, unknown, EmailSyncType>,
    res: Response,
  ): Promise<void> => {
    const data = await emailService.sync(req.user.id, req.body);

    okResponse(res, data, "Emails synced successfully");
  },

  analyzeEmails: async (
    req: Request<unknown, unknown, EmailAnalyzeType>,
    res: Response,
  ): Promise<void> => {
    const data = await emailAnalysisService.enqueuePending(
      req.user.id,
      req.body,
    );

    okResponse(res, data, "Emails queued for analysis");
  },
};
