import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateBodyMiddleware = <T>(schema: ZodType<T>) => {
  return (
    req: Request<unknown, unknown, T>,
    _res: Response,
    next: NextFunction,
  ) => {
    req.body = schema.parse(req.body);
    next();
  };
};

export const validateParamsMiddleware = <T>(schema: ZodType<T>) => {
  return (req: Request<T>, _res: Response, next: NextFunction) => {
    req.params = schema.parse(req.params);
    next();
  };
};

/**
 * Express 5 exposes `req.query` as a getter-only property, so it cannot be
 * reassigned. Defining an own property shadows the prototype getter and
 * preserves the validated (defaulted, stripped) value for the handler.
 */
export const validateQueryMiddleware = <T>(schema: ZodType<T>) => {
  return (
    req: Request<unknown, unknown, unknown, T>,
    _res: Response,
    next: NextFunction,
  ) => {
    Object.defineProperty(req, "query", {
      value: schema.parse(req.query),
      configurable: true,
      enumerable: true,
      writable: true,
    });
    next();
  };
};
