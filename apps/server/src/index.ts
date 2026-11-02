import express from "express";
import { corsConfig } from "./lib/cors";
import cors from "cors";
import { versionRouter } from "./modules/version.route";
import { serverEnv } from "@repo/env/server-env";

const app = express();

app.use(express.json());
app.use(cors(corsConfig));
app.use("/api", versionRouter);

console.log("serverEnv", serverEnv);

app.listen(serverEnv.PORT, () => {
  console.log(`Server started on Port ${serverEnv.PORT}`);
});
