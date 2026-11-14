import { AccountIdType } from "@repo/schemas";
import { Request, Response } from "express";
import { okResponse } from "../../lib/http";
import { accountsService } from "./accounts.service";

export const accountsController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const data = await accountsService.list(req.user.id);

    okResponse(res, data, "Accounts fetched successfully");
  },
  disconnect: async (req: Request<AccountIdType>, res: Response) => {
    const data = await accountsService.disconnect(req.user.id, req.params.id);

    okResponse(res, data, "Account disconnected successfully");
  },
};
