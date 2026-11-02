import { Router } from "express";
import { triageRouter } from "./triage/triage.route";

export const versionRouter = Router() as Router;

versionRouter.use("/v1", triageRouter);
