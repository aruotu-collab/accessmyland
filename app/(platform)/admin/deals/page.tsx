"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/format";
import { useStore } from "@/lib/store";

type Suggestion = {
  id: string;
  source: "nsip" | "planning";
  reference: string;
  name: string;
  summary: string;
  authorities: string[];
  lat: number | null;
  lng: number | null;
  url: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: "new" | "dismissed" | "opened";
  sector: string;
};

type Meta = {
  lastScanAt: string;
  lastError: string;
  lastAdded: number;
  lastScanned: number;
};

export default function AdminDealsPage() {
  const router = useRouter();
  const { importWatchCase } = useStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [query, setQuery] = useState("");
  const [showDismissed, setShowDismissed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/planning", { cache: "no-store" });
    if (!res.ok) {
      setError("Could not load the planning watch.");
      return;
    }
    const data = (await res.json()) as { suggestions?: Suggestion[]; meta?: Meta };
    setSuggestions(data.suggestions ?? []);
    setMeta(data.meta ?? null);
    setError(data.meta?.lastError ?? "");
  }

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      const res = await fetch("/api/admin/planning", { cache: "no-store" });
      if (!res.ok) {
        if (!cancelled) setError("Could not load the planning watch.");
        return;
      }
      const data = (await res.json()) as { suggestions?: Suggestion[]; meta?: Meta };
      if (cancelled) return;
      setSuggestions(data.suggestions ?? []);
      setMeta(data.meta ?? null);
      if (!data.meta?.lastScanAt) {
        setScanning(true);
        const scan = await fetch("/api/admin/planning", { method: "POST" });
        if (scan.ok) {
          const next = (await scan.json()) as {
            suggestions?: Suggestion[];
            meta?: Meta;
          };
          if (!cancelled) {
            setSuggestions(next.suggestions ?? []);
            setMeta(next.meta ?? null);
          }
        } else if (!cancelled) {
          setError("The first scan could not reach Planning Data.");
        }
        if (!cancelled) setScanning(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (suggestions ?? []).filter((item) => {
      if (!showDismissed && item.status === "dismissed") return false;
      if (!q) return true;
      return [item.name, item.reference, item.authorities.join(" "), item.sector]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [suggestions, query, showDismissed]);

  async function scanNow() {
    setScanning(true);
    setError("");
    const res = await fetch("/api/admin/planning", { method: "POST" });
    if (!res.ok) {
      setError("Scan failed. Try again in a minute.");
      setScanning(false);
      return;
    }
    const data = (await res.json()) as { suggestions?: Suggestion[]; meta?: Meta };
    setSuggestions(data.suggestions ?? []);
    setMeta(data.meta ?? null);
    setScanning(false);
  }

  async function setStatus(id: string, status: Suggestion["status"]) {
    const res = await fetch("/api/admin/planning", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { suggestion: Suggestion };
    setSuggestions((current) =>
      current.map((item) => (item.id === data.suggestion.id ? data.suggestion : item)),
    );
  }

  function openInWorkspace(item: Suggestion) {
    const caseId = importWatchCase({
      reference: item.reference,
      name: item.name,
      summary: item.summary,
      authorities: item.authorities,
      lat: item.lat,
      lng: item.lng,
      url: item.url,
      sector: item.sector,
    });
    void setStatus(item.id, "opened");
    router.push(`/cases/${caseId}`);
  }

  const openCount = suggestions.filter((item) => item.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-forest">Deal watch</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Official Planning Data scan of nationally significant infrastructure
            that intersects Lincolnshire, plus access-relevant local applications
            when councils publish them.
          </p>
        </div>
        <button
          onClick={() => void scanNow()}
          disabled={scanning}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep disabled:opacity-60"
        >
          {scanning ? "Scanning…" : "Scan now"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Open suggestions", v: String(openCount) },
          { l: "Last scan found", v: meta ? String(meta.lastScanned) : "—" },
          {
            l: "Last scanned",
            v: meta?.lastScanAt ? formatDateTime(meta.lastScanAt) : "Not yet",
          },
        ].map((card) => (
          <div key={card.l} className="rounded-2xl bg-white p-5 hairline">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">
              {card.l}
            </div>
            <div className="mt-2 font-serif text-2xl text-forest">{card.v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search project, reference or district"
          className="min-w-[240px] flex-1 rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-forest"
        />
        <label className="flex items-center gap-2 text-sm text-slate">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(event) => setShowDismissed(event.target.checked)}
          />
          Show dismissed
        </label>
      </div>

      {error ? <p className="text-sm text-clay">{error}</p> : null}

      <div className="space-y-3">
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-slate hairline">
            {scanning
              ? "Scanning Lincolnshire infrastructure boundaries…"
              : "No matching schemes yet. Run a scan, or wait for the daily 06:00 watch."}
          </div>
        ) : (
          visible.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white p-5 hairline">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-brass-deep">
                    {item.source === "nsip" ? "NSIP" : "Planning"} · {item.sector}
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-forest">{item.name}</h2>
                  <p className="mt-1 text-sm text-slate">{item.reference}</p>
                </div>
                <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-forest">
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate">{item.summary}</p>
              <p className="mt-2 text-xs text-slate">
                {item.authorities.join(", ")}
                {item.lat != null && item.lng != null
                  ? ` · ${item.lat.toFixed(3)}, ${item.lng.toFixed(3)}`
                  : ""}
                {item.lastSeenAt ? ` · seen ${formatDateTime(item.lastSeenAt)}` : ""}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-forest hover:border-forest"
                >
                  Open register
                </a>
                <button
                  onClick={() => openInWorkspace(item)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-forest hover:border-forest"
                >
                  Open as case
                </button>
                {item.status !== "dismissed" ? (
                  <button
                    onClick={() => void setStatus(item.id, "dismissed")}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-slate hover:border-clay hover:text-clay"
                  >
                    Dismiss
                  </button>
                ) : (
                  <button
                    onClick={() => void setStatus(item.id, "new")}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-slate hover:border-forest hover:text-forest"
                  >
                    Restore
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
