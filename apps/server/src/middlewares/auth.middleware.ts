import { fromNodeHeaders } from "better-auth/node";
import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/better-auth";
import { AppError } from "./error.middleware";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const headers = fromNodeHeaders(req.headers);

    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw new AppError("Unauthorized Access", 401);
    }

    if (!session.user.emailVerified) {
      throw new AppError("Email not verified", 403, undefined, {
        code: "EMAIL_NOT_VERIFIED",
        message: "Verify your email address to continue",
      });
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    if (err instanceof AppError) {
      throw err;
    }

    return res.status(500).json({
      status: 500,
      message: "Unexpected error",
    });
  }
};
