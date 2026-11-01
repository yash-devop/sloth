import express from "express";
import { corsConfig } from "./lib/cors";
import cors from "cors";
import { versionRouter } from "./modules/version.route";
import { env } from "./env";

const app = express();
app.use(express.json());
app.use(cors(corsConfig));

app.use("api", versionRouter);

app.listen(env.PORT, () => {
  console.log(`Server started on Port ${env.PORT}`);
});
