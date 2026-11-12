import { Response } from "express";

export const ErrorCodes = [
  "INTERNAL_ERROR",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "ALREADY_PRESENT",
  "INVALID",
  "REQUIRED",
  "FAILED",
  "CONFLICT",
] as const;

export type TErrorCode = (typeof ErrorCodes)[number];

export type TApiError = {
  code: TErrorCode;
  message: string;
  details: unknown;
};

export type TApiEnvelope<T> = {
  status: number;
  data: T;
  message: string;
  error: TApiError | null;
  success: boolean;
};

export type TApiResponse<T> = Response<TApiEnvelope<T>>;
