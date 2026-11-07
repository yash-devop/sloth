import { serverEnv } from "@repo/env/server-env";
import { defineConfig } from "prisma/config";

// import { resolveEnvFile } from "@repo/env/resolve-env-file";

// config({ path: await resolveEnvFile() });

export default defineConfig({
  schema: "prisma/",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // url: env("DATABASE_URL"),
    url: serverEnv.DATABASE_URL,
  },
});
