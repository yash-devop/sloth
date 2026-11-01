import cors, { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: ["https://localhost:3000"],
  credentials: true,
};
