import { Router } from "express";
import { accountsController } from "./accounts.controller";
import { validateParamsMiddleware } from "../../middlewares/validate.middleware";
import { accountIdSchema } from "@repo/schemas";

export const accountsRouter = Router() as Router;

accountsRouter.get("/accounts", accountsController.list);
accountsRouter.delete(
  "/accounts/:id",
  validateParamsMiddleware(accountIdSchema),
  accountsController.disconnect,
);
