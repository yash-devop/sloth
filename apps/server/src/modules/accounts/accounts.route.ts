import { Router } from "express";
import { accountsController } from "./accounts.controller";

export const accountsRouter = Router() as Router;

accountsRouter.get("/accounts", accountsController.list);
