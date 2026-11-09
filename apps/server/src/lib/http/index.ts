import { Response } from "express";

export const ok = <T>(res: Response, data: T, message: string = "Ok") => {
  return res.status(200).json({ status: 200, data, message, error: null });
};
export const created = <T>(res: Response, data: T, message: string = "Created") => {
  return res.status(201).json({ status: 201, data, message, error: null });
};
