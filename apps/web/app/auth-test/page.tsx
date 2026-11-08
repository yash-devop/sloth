"use client";

import { linkSocial, signIn, signOut, useSession } from "@/lib/auth-client";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const CALLBACK_URL = "http://localhost:3000/auth-test";

export default function AuthTestPage() {
  const { data: session, isPending } = useSession();

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Better Auth test</h1>

      {isPending ? <p>Loading session...</p> : null}

      {session ? (
        <>
          <p>Signed in as {session.user.email}</p>

          <button
            onClick={() =>
              linkSocial({
                provider: "google",
                scopes: GMAIL_SCOPES,
                callbackURL: CALLBACK_URL,
              })
            }
          >
            Connect Gmail
          </button>

          <button onClick={() => signOut()}>Sign out</button>
        </>
      ) : (
        <button
          onClick={() =>
            signIn.social({
              provider: "google",
              callbackURL: CALLBACK_URL,
            })
          }
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
