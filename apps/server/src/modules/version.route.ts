import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { accountsRouter } from "./accounts/accounts.route";
import { emailRouter } from "./email/email.route";
import { triageRouter } from "./triage/triage.route";

export const versionRouter = Router() as Router;

versionRouter.use("/v1", authMiddleware, triageRouter);
versionRouter.use("/v1", authMiddleware, emailRouter);
versionRouter.use("/v1", authMiddleware, accountsRouter);
