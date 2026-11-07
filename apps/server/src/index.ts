import { serverEnv } from "@repo/env/server-env";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/better-auth";
import { corsConfig } from "./lib/cors";
import { errorMiddleware } from "./middlewares/error.middleware";
import { versionRouter } from "./modules/version.route";

const app = express();

app.use(express.json());
app.use(cors(corsConfig));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api", versionRouter);

app.use(errorMiddleware);
app.listen(serverEnv.PORT, () => {
  console.log(`Server started on Port ${serverEnv.PORT}`);
});
