import { emailAnalyzeSchema, emailSyncSchema } from "@repo/schemas";
import { Router } from "express";
import { validateBodyMiddleware } from "../../middlewares/validate.middleware";
import { emailController } from "./email.controller";

export const emailRouter = Router() as Router;

emailRouter.get("/emails", emailController.getEmails);
emailRouter.get("/emails/:id", emailController.getEmail);
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
