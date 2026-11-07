import { CorsOptions } from "cors";

export const allowedOrigins = ["https://localhost:3000"];

export const corsConfig: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
