"use client";

import { useEffect, useState } from "react";

type SystemInfo = {
  env: {
    authSecret: boolean;
    resend: boolean;
    fromAddress: boolean;
    appUrl: boolean;
    analytics: boolean;
  };
  runtime: "vercel" | "local";
  stats: { totalVisits: number; accounts: number };
};

export default function AdminSystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/system", { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setError("Could not load system status.");
        return;
      }
      const data = (await res.json()) as SystemInfo;
      if (!cancelled) setInfo(data);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const checks = info
    ? [
        { l: "Auth secret", ok: info.env.authSecret },
        { l: "Resend API key", ok: info.env.resend },
        { l: "From address", ok: info.env.fromAddress },
        { l: "Public site URL", ok: info.env.appUrl },
        { l: "Google Analytics", ok: info.env.analytics },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-forest">System</h1>
        <p className="mt-2 max-w-2xl text-slate">
          Health of the live sign-in and measurement setup. Secret values are
          never shown here.
        </p>
      </div>

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.l} className="rounded-2xl bg-white p-5 hairline">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">
              {check.l}
            </div>
            <div className={`mt-2 font-serif text-2xl ${check.ok ? "text-forest" : "text-clay"}`}>
              {check.ok ? "Configured" : "Missing"}
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl bg-white p-5 hairline">
        <h2 className="font-serif text-2xl text-forest">Runtime</h2>
        <dl className="mt-4 space-y-2 text-sm text-slate">
          <div className="flex justify-between">
            <dt>Hosting</dt>
            <dd className="text-forest">
              {info?.runtime === "vercel" ? "Vercel production" : "Local development"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt>Recorded visits</dt>
            <dd className="text-forest">{info?.stats.totalVisits ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Known accounts</dt>
            <dd className="text-forest">{info?.stats.accounts ?? "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl bg-white p-5 hairline">
        <h2 className="font-serif text-2xl text-forest">External consoles</h2>
        <ul className="mt-4 space-y-2 text-sm">
          <li>
            <a
              href="https://analytics.google.com/"
              className="text-forest hover:text-brass-deep"
              target="_blank"
              rel="noreferrer"
            >
              Google Analytics
            </a>
          </li>
          <li>
            <a
              href="https://search.google.com/search-console?resource_id=sc-domain:accessmyland.com"
              className="text-forest hover:text-brass-deep"
              target="_blank"
              rel="noreferrer"
            >
              Google Search Console
            </a>
          </li>
          <li>
            <a
              href="https://vercel.com/aruotu-collabs-projects/accessmyland"
              className="text-forest hover:text-brass-deep"
              target="_blank"
              rel="noreferrer"
            >
              Vercel project
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
