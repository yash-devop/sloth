import { Response } from "express";
import { TApiEnvelope, TApiResponse, TErrorCode } from "../../types/http.type";

const send = <T>(
  res: TApiResponse<T>,
  status: number,
  data: T,
  message: string,
): TApiResponse<T> =>
  res.status(status).json({
    status,
    data,
    message,
    error: null,
    success: true,
  });

export const okResponse = <T>(
  res: TApiResponse<T>,
  data: T,
  message: string = "Ok",
): TApiResponse<T> => send(res, 200, data, message);

export const createdResponse = <T>(
  res: Response<TApiEnvelope<T>>,
  data: T,
  message: string = "Created",
): TApiResponse<T> => send(res, 201, data, message);

export const errorResponse = (
  res: Response<TApiEnvelope<null>>,
  status: number,
  code: TErrorCode,
  message: string,
  details?: unknown,
): TApiResponse<null> =>
  res.status(status).json({
    status,
    data: null,
    message,
    error: { code, message, details: details ?? null },
    success: false,
  });
