import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { triageRouter } from "./triage/triage.route";

export const versionRouter = Router() as Router;

versionRouter.use("/v1", authMiddleware, triageRouter);
