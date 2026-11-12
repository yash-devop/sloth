import { Prisma } from "@repo/db";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { errorResponse } from "../lib/http";
import { TErrorCode } from "../types/http.type";

export class AppError extends Error {
  status: number;
  code: TErrorCode;
  meta?: unknown;

  constructor(
    message: string,
    status = 500,
    code: TErrorCode = "INTERNAL_ERROR",
    meta?: unknown,
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.meta = meta;
  }
}

const mapPrismaCode = (code: string): { status: number; code: TErrorCode } => {
  switch (code) {
    case "P2002":
      return { status: 409, code: "ALREADY_PRESENT" };
    case "P2025":
      return { status: 404, code: "NOT_FOUND" };
    default:
      return { status: 409, code: "CONFLICT" };
  }
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "Invalid request payload",
      err.issues,
    );
  }

  if (err instanceof Prisma.Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaCode(err.code);

    return errorResponse(
      res,
      mapped.status,
      mapped.code,
      "Database constraint error",
      err.meta,
    );
  }

  if (err instanceof Prisma.Prisma.PrismaClientValidationError) {
    return errorResponse(
      res,
      400,
      "VALIDATION_ERROR",
      "Database validation error",
    );
  }

  if (err instanceof AppError) {
    return errorResponse(res, err.status, err.code, err.message, err.meta);
  }

  return errorResponse(res, 500, "INTERNAL_ERROR", "Something went wrong");
};
