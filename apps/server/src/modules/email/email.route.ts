import {
  emailAnalyzeSchema,
  emailIdSchema,
  emailInboxSummaryQuerySchema,
  emailListQuerySchema,
  emailSyncSchema,
} from "@repo/schemas";
import { Router } from "express";
import {
  validateBodyMiddleware,
  validateParamsMiddleware,
  validateQueryMiddleware,
} from "../../middlewares/validate.middleware";
import { emailController } from "./email.controller";

export const emailRouter = Router() as Router;

emailRouter.get(
  "/emails",
  validateQueryMiddleware(emailListQuerySchema),
  emailController.getEmails,
);

emailRouter.post(
  "/emails/sync",
  validateBodyMiddleware(emailSyncSchema),
  emailController.syncEmails,
);
emailRouter.post(
  "/emails/analyze",
  validateBodyMiddleware(emailAnalyzeSchema),
  emailController.analyzeEmails,
);
emailRouter.get(
  "/inbox/summary",
  validateQueryMiddleware(emailInboxSummaryQuerySchema),
  emailController.summary,
);
emailRouter.get(
  "/emails/:id",
  validateParamsMiddleware(emailIdSchema),
  emailController.getEmail,
);
