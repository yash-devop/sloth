import { emailInputSchema } from "@repo/schemas";
import { Router } from "express";
import { validateBodyMiddleware } from "../../middlewares/validate.middleware";
import { triageController } from "./triage.controller";

export const triageRouter = Router() as Router;

triageRouter.post(
  "/triage",
  validateBodyMiddleware(emailInputSchema),
  triageController.classify,
);
