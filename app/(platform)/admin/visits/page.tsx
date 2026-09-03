"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { displayLocation } from "@/lib/visit";

type Visit = {
  id: string;
  at: string;
  path: string;
  referrer: string;
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  email: string;
};

function locationLabel(visit: Visit) {
  return displayLocation(visit);
}

export default function AdminVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/visits", { cache: "no-store" });
    if (!res.ok) {
      setError("Could not load visits.");
      return;
    }
    const data = (await res.json()) as { visits: Visit[] };
    setVisits(data.visits);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visits;
    return visits.filter((visit) =>
      [visit.ip, visit.city, visit.region, visit.country, visit.path, visit.email, visit.referrer]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [visits, query]);

  function exportCsv() {
    const header = [
      "Time",
      "IP",
      "City",
      "Region",
      "Country",
      "Path",
      "Referrer",
      "Device",
      "Browser",
      "Signed-in email",
    ];
    const rows = filtered.map((visit) => [
      visit.at,
      visit.ip,
      visit.city,
      visit.region,
      visit.country,
      visit.path,
      visit.referrer,
      visit.device,
      visit.browser,
      visit.email,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "accessmyland-visits.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function clearVisits() {
    if (!confirm("Clear the recorded web visits?")) return;
    const res = await fetch("/api/admin/visits", { method: "DELETE" });
    if (res.ok) setVisits([]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-forest">Web visits</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Each page view records the visitor IP and the location Vercel (or the
            local network) reports for that request.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="rounded-full border border-line px-4 py-2 text-sm text-slate hover:border-forest hover:text-forest"
          >
            Export CSV
          </button>
          <button
            onClick={() => void clearVisits()}
            className="rounded-full border border-line px-4 py-2 text-sm text-slate hover:border-clay hover:text-clay"
          >
            Clear log
          </button>
        </div>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search IP, city, page or email"
        className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-forest"
      />

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl bg-white hairline">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-slate">
            <tr>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">IP address</th>
              <th className="px-4 py-3 font-medium">Visiting from</th>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Device</th>
              <th className="px-4 py-3 font-medium">Signed in</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-slate">
                  No visits recorded yet. Open the public site or another page,
                  then refresh this list.
                </td>
              </tr>
            ) : (
              filtered.map((visit) => (
                <tr key={visit.id} className="border-b border-line/70 last:border-0">
                  <td className="whitespace-nowrap px-4 py-3 text-slate">
                    {formatDateTime(visit.at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-forest">{visit.ip}</td>
                  <td className="px-4 py-3 text-slate">
                    {locationLabel(visit)}
                    {visit.referrer ? (
                      <div className="max-w-xs truncate text-xs text-slate/70">
                        via {visit.referrer}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-forest">{visit.path}</td>
                  <td className="px-4 py-3 text-slate">
                    {visit.device} · {visit.browser}
                  </td>
                  <td className="px-4 py-3 text-slate">{visit.email || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
