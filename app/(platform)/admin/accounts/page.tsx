"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { ADMIN_EMAIL } from "@/lib/admin";
import { displayLocation } from "@/lib/visit";

type Account = {
  email: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSignInAt: string;
  magicLinkCount: number;
  signInCount: number;
  lastIp: string;
  lastCity: string;
  lastCountry: string;
};

type EventRow = {
  id: string;
  at: string;
  kind: "magic_link" | "sign_in" | "profile";
  email: string;
  ip: string;
  city: string;
  country: string;
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/admin/accounts", { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setError("Could not load accounts.");
        return;
      }
      const data = (await res.json()) as { accounts: Account[]; events: EventRow[] };
      if (cancelled) return;
      setAccounts(data.accounts);
      setEvents(data.events);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl text-forest">Accounts</h1>
        <p className="mt-2 max-w-2xl text-slate">
          Anyone can request a magic link. Only {ADMIN_EMAIL} can open this
          administrator menu and these tools.
        </p>
      </div>

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      <section className="overflow-x-auto rounded-2xl bg-white hairline">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Last IP</th>
              <th className="px-4 py-3 font-medium">Last location</th>
              <th className="px-4 py-3 font-medium">Magic links</th>
              <th className="px-4 py-3 font-medium">Sign-ins</th>
              <th className="px-4 py-3 font-medium">Last seen</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-slate">
                  No accounts have requested a sign-in email yet.
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.email} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3 font-medium text-forest">
                    {account.email}
                    {account.email === ADMIN_EMAIL ? (
                      <span className="ml-2 rounded-full bg-brass/15 px-2 py-0.5 text-xs text-brass-deep">
                        Admin
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate">{account.lastIp || "—"}</td>
                  <td className="px-4 py-3 text-slate">
                    {displayLocation({
                      city: account.lastCity,
                      country: account.lastCountry,
                      ip: account.lastIp,
                    })}
                  </td>
                  <td className="px-4 py-3 text-slate">{account.magicLinkCount}</td>
                  <td className="px-4 py-3 text-slate">{account.signInCount}</td>
                  <td className="px-4 py-3 text-slate">
                    {account.lastSeenAt ? formatDateTime(account.lastSeenAt) : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Sign-in log</h2>
        <ul className="mt-4 space-y-3 rounded-2xl bg-white p-5 hairline">
          {events.length === 0 ? (
            <li className="text-sm text-slate">No events yet.</li>
          ) : (
            events.map((event) => (
              <li key={event.id} className="flex flex-wrap justify-between gap-2 text-sm">
                <div>
                  <span className="font-medium text-forest">{event.email}</span>
                  <span className="text-slate">
                    {" "}
                    {event.kind === "magic_link"
                      ? "asked for a sign-in email"
                      : event.kind === "sign_in"
                        ? "signed in"
                        : "saved their profile"}
                  </span>
                  {event.ip ? (
                    <div className="text-xs text-slate">
                      {event.ip}
                      {event.city || event.country
                        ? ` · ${[event.city, event.country].filter(Boolean).join(", ")}`
                        : ""}
                    </div>
                  ) : null}
                </div>
                <span className="text-xs text-slate">{formatDateTime(event.at)}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
