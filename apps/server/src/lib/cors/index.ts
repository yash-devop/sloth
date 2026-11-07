import { serverEnv } from "@repo/env/server-env";
import { CorsOptions } from "cors";

export const allowedOrigins = [
  serverEnv.NEXT_PUBLIC_FRONTEND_URL.replace(/\/$/, ""),
];

export const corsConfig: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
