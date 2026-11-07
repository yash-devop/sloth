import express from "express";
import { corsConfig } from "./lib/cors";
import cors from "cors";
import { versionRouter } from "./modules/version.route";
import { serverEnv } from "@repo/env/server-env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/better-auth";

const app = express();

app.use(express.json());
app.use(cors(corsConfig));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", versionRouter);

app.use(errorMiddleware);
app.listen(serverEnv.PORT, () => {
  console.log(`Server started on Port ${serverEnv.PORT}`);
});
