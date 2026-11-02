import { Router } from "express";
import { triageController } from "./triage.controller";

export const triageRouter = Router() as Router;

triageRouter.get("/triage", triageController.test);
