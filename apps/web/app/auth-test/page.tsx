"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { linkSocial, signIn, signOut, useSession } from "@/lib/auth-client";

const CALLBACK_URL = "http://localhost:3000/auth-test";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.modify",
];

const LINK_ERRORS: Record<string, string> = {
  account_already_linked_to_different_user:
    "This Gmail account is already connected to another Sloth account.",
  email_does_not_match: "The Google account email does not match your account.",
  unable_to_link_account: "Could not connect this Gmail account.",
  access_denied: "Google consent was cancelled.",
};

function AuthTestContent() {
  const { data: session, isPending } = useSession();
  const error = useSearchParams().get("error");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>Better Auth test</h1>

      {isPending ? <p>Loading session...</p> : null}

      {error ? (
        <p>{LINK_ERRORS[error] ?? "Could not connect this Gmail account."}</p>
      ) : null}

      {session ? (
        <>
          <p>Signed in as {session.user.email}</p>

          <button
            onClick={() =>
              linkSocial({
                provider: "google",
                scopes: GMAIL_SCOPES,
                callbackURL: CALLBACK_URL,
                errorCallbackURL: CALLBACK_URL,
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

export default function AuthTestPage() {
  return (
    <Suspense fallback={null}>
      <AuthTestContent />
    </Suspense>
  );
}
