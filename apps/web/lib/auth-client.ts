import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
  },
});

export const { linkSocial, signIn, signOut, useSession } = authClient;
