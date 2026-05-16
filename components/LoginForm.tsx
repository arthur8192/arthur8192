"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/doma8192`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo
      }
    });

    setStatus(error ? "error" : "sent");
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
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "TRANSMITTING..." : "AUTHENTICATE"}
      </button>
      <p>A verification link will be sent to your registered email.</p>
      {status === "sent" ? <strong>LINK SENT. CHECK YOUR EMAIL.</strong> : null}
      {status === "error" ? <strong className="signal-error">AUTHENTICATION FAILED.</strong> : null}
    </form>
  );
}
