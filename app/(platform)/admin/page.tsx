"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";

type Stats = {
  visits24h: number;
  uniqueIps24h: number;
  signIns24h: number;
  magicLinks24h: number;
  accounts: number;
  totalVisits: number;
  topCountries: { label: string; count: number }[];
  topPages: { label: string; count: number }[];
};

type Account = {
  email: string;
  lastSeenAt: string;
  lastCountry: string;
  lastIp: string;
};

type EventRow = {
  id: string;
  at: string;
  kind: string;
  email: string;
  country: string;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setError("Could not load administrator data.");
        return;
      }
      const data = (await res.json()) as {
        stats: Stats;
        recentAccounts: Account[];
        recentEvents: EventRow[];
      };
      if (cancelled) return;
      setStats(data.stats);
      setAccounts(data.recentAccounts);
      setEvents(data.recentEvents);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          Administrator
        </p>
        <h1 className="mt-1 font-serif text-4xl text-forest">Site control</h1>
        <p className="mt-2 max-w-2xl text-slate">
          Visible only on aruotu@gmail.com. Review traffic, sign-ins, and the
          live workspace from here.
        </p>
      </div>

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "Visits, 24 hours", v: stats ? String(stats.visits24h) : "—" },
          { l: "Unique IPs, 24 hours", v: stats ? String(stats.uniqueIps24h) : "—" },
          { l: "Sign-ins, 24 hours", v: stats ? String(stats.signIns24h) : "—" },
          { l: "Accounts seen", v: stats ? String(stats.accounts) : "—" },
        ].map((card) => (
          <div key={card.l} className="rounded-2xl bg-white p-5 hairline">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">
              {card.l}
            </div>
            <div className="mt-2 font-serif text-3xl text-forest">{card.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 hairline">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-forest">Where people visit from</h2>
            <Link href="/admin/visits" className="text-sm text-forest hover:text-brass-deep">
              All visits
            </Link>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(stats?.topCountries.length ? stats.topCountries : [{ label: "No visits yet", count: 0 }]).map(
              (row) => (
                <li key={row.label} className="flex justify-between text-slate">
                  <span>{row.label}</span>
                  <span className="font-medium text-forest">{row.count}</span>
                </li>
              ),
            )}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 hairline">
          <h2 className="font-serif text-2xl text-forest">Most viewed pages</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(stats?.topPages.length ? stats.topPages : [{ label: "No visits yet", count: 0 }]).map(
              (row) => (
                <li key={row.label} className="flex justify-between gap-4 text-slate">
                  <span className="truncate">{row.label}</span>
                  <span className="font-medium text-forest">{row.count}</span>
                </li>
              ),
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 hairline">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-forest">Recent accounts</h2>
            <Link href="/admin/accounts" className="text-sm text-forest hover:text-brass-deep">
              Directory
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {accounts.length === 0 ? (
              <li className="text-slate">No sign-in emails recorded yet.</li>
            ) : (
              accounts.map((account) => (
                <li key={account.email} className="flex justify-between gap-3">
                  <div>
                    <div className="font-medium text-forest">{account.email}</div>
                    <div className="text-xs text-slate">
                      {account.lastCountry || "Unknown location"}
                      {account.lastIp ? ` · ${account.lastIp}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-slate">
                    {account.lastSeenAt ? formatDateTime(account.lastSeenAt) : ""}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-2xl bg-white p-5 hairline">
          <h2 className="font-serif text-2xl text-forest">Sign-in activity</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {events.length === 0 ? (
              <li className="text-slate">No magic-link or sign-in events yet.</li>
            ) : (
              events.map((event) => (
                <li key={event.id} className="flex justify-between gap-3">
                  <div>
                    <div className="font-medium text-forest">{event.email}</div>
                    <div className="text-xs text-slate">
                      {event.kind === "magic_link"
                        ? "Requested a sign-in email"
                        : event.kind === "sign_in"
                          ? "Signed in"
                          : "Updated profile"}
                      {event.country ? ` · ${event.country}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-slate">
                    {formatDateTime(event.at)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
