import { findUp } from "find-up";

const ENV_FILE_NAMES = {
  development: [".env.local", ".env"],
  production: [".env.production", ".env"],
} as const;

export async function resolveEnvFile(): Promise<string | undefined> {
  const names =
    process.env.NODE_ENV === "production"
      ? ENV_FILE_NAMES.production
      : ENV_FILE_NAMES.development;

  return findUp([...names], { type: "file" });
}
