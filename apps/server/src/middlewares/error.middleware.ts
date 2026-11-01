import { Prisma } from "@repo/db";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const ErrorCodes = [
  "INTERNAL_ERROR",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "ALREADY_PRESENT",
  "INVALID",
  "REQUIRED",
  "FAILED",
] as const;

export type TErrorCode = (typeof ErrorCodes)[number];

export class AppError extends Error {
  status: number;
  code: TErrorCode;
  meta?: any;

  constructor(
    message: string,
    status = 500,
    code: TErrorCode = "INTERNAL_ERROR",
    meta?: any,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Global Error Catch => ", err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 400,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request payload",
      },
      meta: JSON.parse(err.message),
    });
  }

  if (err instanceof Prisma.Prisma.PrismaClientKnownRequestError) {
    return res.status(409).json({
      status: 409,
      error: {
        code: err.code,
        message: "Database constraint error",
        cause: err.meta?.cause as string | undefined,
      },
      meta: err.meta,
    });
  }

  if (err instanceof Prisma.Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      status: 400,
      error: {
        code: "PRISMA_VALIDATION_ERROR",
        message: err.message,
      },
      meta: null,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      status: err.status,
      error: {
        code: err.code,
        message: err.message,
      },
      meta: err.meta,
    });
  }

  return res.status(500).json({
    status: 500,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    },
    meta: null,
  });
};
