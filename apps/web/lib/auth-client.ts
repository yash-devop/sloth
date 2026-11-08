import { createAuthClient } from "better-auth/react";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export const { linkSocial, signIn, signOut, useSession } = authClient;
