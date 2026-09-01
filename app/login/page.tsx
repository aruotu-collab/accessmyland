"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ROLE_LABEL } from "@/lib/format";
import { USERS, useStore } from "@/lib/store";

const BLURB = {
  operator:
    "Run the East Coast GI corridor, Fenland Solar and the 132kV diversion. Negotiate Ellis Farm, list overflow on the marketplace.",
  agent:
    "You have already claimed Billingborough. Pick up Ancaster ridge from the marketplace and move files to licence.",
  landowner:
    "You are Margaret Ellis. Review the £780 revised offer on your north arable, counter, or sign when terms land.",
};

function LoginForm() {
  const { login, user, sessionUser, ready, signOut } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const pickingSeat = params.get("seat") === "1";
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(
    params.get("error") === "invalid"
      ? "That sign-in link is invalid or has expired. Request a new one."
      : "",
  );

  useEffect(() => {
    if (ready && user && !pickingSeat) router.replace("/dashboard");
  }, [ready, user, pickingSeat, router]);

  async function sendLink(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not send the sign-in email.");
        return;
      }
      setSent(true);
    } catch {
      setError("Could not send the sign-in email.");
    } finally {
      setSending(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-slate">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <Logo />
        <div className="my-auto grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass-deep">
              {sessionUser || pickingSeat ? "Choose a workspace" : "Passwordless sign-in"}
            </p>
            <h1 className="mt-4 font-serif text-5xl text-forest">
              {sessionUser ? "Choose a seat at the table." : "Sign in with email."}
            </h1>
            <p className="mt-4 max-w-md text-slate">
              {sessionUser
                ? `Signed in as ${sessionUser.email}. Pick a vantage point on the Lincolnshire programme, or stay in your own operator seat.`
                : "We’ll send a unique link to your inbox. Use it to open AccessMyLand — no password required."}
            </p>
          </div>
          <div>
            {!sessionUser ? (
              sent ? (
                <div className="rounded-2xl border border-line bg-white/80 p-6">
                  <div className="font-serif text-2xl text-forest">Check your inbox.</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    We sent a sign-in link to <span className="font-medium text-forest">{email}</span>.
                    It expires in 15 minutes. If you don’t see it, look in spam.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-5 text-sm font-medium text-forest hover:text-brass-deep"
                  >
                    Use a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={sendLink} className="rounded-2xl border border-line bg-white/80 p-6">
                  <label htmlFor="email" className="text-sm font-medium text-forest">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-forest outline-none focus:border-forest"
                  />
                  {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
                  <button
                    type="submit"
                    disabled={sending}
                    className="mt-5 w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-60"
                  >
                    {sending ? "Sending link…" : "Email me a sign-in link"}
                  </button>
                </form>
              )
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    login(sessionUser.id);
                    router.push("/dashboard");
                  }}
                  className="w-full rounded-2xl border border-forest bg-white/80 p-5 text-left transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif text-xl text-forest">{sessionUser.name}</div>
                      <div className="text-sm text-slate">{sessionUser.email}</div>
                    </div>
                    <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
                      Your account
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate">
                    Open the operator workspace as yourself.
                  </p>
                </button>
                {USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      login(u.id);
                      router.push("/dashboard");
                    }}
                    className="w-full rounded-2xl border border-line bg-white/80 p-5 text-left transition hover:border-forest hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-serif text-xl text-forest">{u.name}</div>
                        <div className="text-sm text-slate">
                          {u.title} · {u.org}
                        </div>
                      </div>
                      <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
                        {ROLE_LABEL[u.role]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate">{BLURB[u.role]}</p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setSent(false);
                  }}
                  className="pt-2 text-sm text-slate hover:text-forest"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-paper text-slate">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
