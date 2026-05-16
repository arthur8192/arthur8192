"use client";

import { FormEvent, useState } from "react";
import {
  createSupabaseBrowserClient,
  getSupabaseBrowserConfigError
} from "@/lib/supabase-client";

const MAGIC_LINK_TIMEOUT_MS = 15000;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unable to send verification link. Check the Supabase configuration.";
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "Supabase did not respond. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        )
      );
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const trimmedEmail = email.trim();
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error(
          getSupabaseBrowserConfigError() ??
            "Supabase public configuration is unavailable in this deployment."
        );
      }

      const redirectTo = `${window.location.origin}/doma8192`;
      const { error } = await withTimeout(
        supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: {
            emailRedirectTo: redirectTo,
            shouldCreateUser: false
          }
        }),
        MAGIC_LINK_TIMEOUT_MS
      );

      if (error) {
        throw error;
      }

      setStatus("sent");
      setMessage("LINK SENT. CHECK YOUR EMAIL.");
    } catch (error) {
      setStatus("error");
      setMessage(getErrorMessage(error));
    }
  }

  return (
    <form className="login-panel" onSubmit={handleSubmit}>
      <h1>RESTRICTED ACCESS</h1>
      <label>
        <span>EMAIL</span>
        <input
          required
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event) => {
            setEmail(event.target.value);
            if (status === "error") {
              setStatus("idle");
              setMessage("");
            }
          }}
        />
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "TRANSMITTING..." : "AUTHENTICATE"}
      </button>
      <p>A verification link will be sent to your registered email.</p>
      {status === "sent" ? <strong>{message}</strong> : null}
      {status === "error" ? <strong className="signal-error">{message}</strong> : null}
    </form>
  );
}
