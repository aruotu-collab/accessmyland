"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useStore } from "@/lib/store";

export default function WelcomePage() {
  const { ready, sessionUser, profileComplete, completeProfile, signOut } =
    useStore();
  const router = useRouter();
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!sessionUser) {
      router.replace("/login");
      return;
    }
    if (profileComplete) {
      router.replace("/dashboard");
    }
  }, [ready, sessionUser, profileComplete, router]);

  useEffect(() => {
    if (!sessionUser || prefilled) return;
    setName(sessionUser.name);
    setOrg(sessionUser.org === "AccessMyLand" ? "" : sessionUser.org);
    setPrefilled(true);
  }, [sessionUser, prefilled]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await completeProfile(name, org);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || !sessionUser || profileComplete) {
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
              First visit
            </p>
            <h1 className="mt-4 font-serif text-5xl text-forest">
              A few details.
            </h1>
            <p className="mt-4 max-w-md text-slate">
              We use your name on offers, licences and activity. Company is
              optional — landowners and independents can leave it blank.
            </p>
          </div>
          <form
            onSubmit={save}
            className="rounded-2xl border border-line bg-white/80 p-6"
          >
            <label htmlFor="name" className="text-sm font-medium text-forest">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Margaret Ellis"
              className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-forest outline-none focus:border-forest"
            />
            <label
              htmlFor="org"
              className="mt-5 block text-sm font-medium text-forest"
            >
              Company <span className="font-normal text-slate">(optional)</span>
            </label>
            <input
              id="org"
              type="text"
              autoComplete="organization"
              maxLength={80}
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Northern Grid Alliance"
              className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-forest outline-none focus:border-forest"
            />
            {error ? <p className="mt-3 text-sm text-clay">{error}</p> : null}
            <button
              type="submit"
              disabled={saving}
              className="mt-5 w-full rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-60"
            >
              {saving ? "Saving…" : "Continue to AccessMyLand"}
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="mt-4 w-full text-sm text-slate hover:text-forest"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
