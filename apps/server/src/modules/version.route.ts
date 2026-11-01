import { Router } from "express";

export const versionRouter = Router() as Router;

versionRouter.use("/v1", () => {});
