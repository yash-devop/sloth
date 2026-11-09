import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateBodyMiddleware = <T>(schema: ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
};
