"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { ACCESS_LABEL, gbp, latestOffer } from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";
import { BOARD_COLUMNS } from "@/lib/workflow";

export default function CasesPage() {
  const { user, cases } = useStore();
  const [view, setView] = useState<"board" | "list">("board");
  const [q, setQ] = useState("");

  const visible = useMemo(() => {
    let list = cases;
    if (user?.role === "landowner") list = list.filter((c) => c.owner.userId === user.id);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        (c) =>
          c.ref.toLowerCase().includes(s) ||
          c.parcel.title.toLowerCase().includes(s) ||
          c.owner.name.toLowerCase().includes(s),
      );
    }
    return list;
  }, [cases, user, q]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-forest">Access cases</h1>
          <p className="mt-2 text-slate">
            One file per parcel. Negotiation, licence, visit, evidence, pay.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref, parcel, owner"
            className="rounded-full border border-line bg-white px-4 py-2 text-sm outline-none focus:border-forest"
          />
          <button
            onClick={() => setView("board")}
            className={`rounded-full px-3 py-2 text-sm ${view === "board" ? "bg-forest text-cream" : "bg-white hairline"}`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-full px-3 py-2 text-sm ${view === "list" ? "bg-forest text-cream" : "bg-white hairline"}`}
          >
            List
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-4">
          {BOARD_COLUMNS.map((col) => {
            const cards = visible.filter((c) => col.statuses.includes(c.status));
            return (
              <div key={col.id} className="w-[260px] shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">
                    {col.title}
                  </h2>
                  <span className="text-xs text-slate">{cards.length}</span>
                </div>
                <div className="space-y-3">
                  {cards.map((c) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="block rounded-2xl bg-white p-4 hairline hover:border-forest"
                    >
                      <div className="text-xs font-semibold text-brass-deep">{c.ref}</div>
                      <div className="mt-1 text-sm font-medium text-forest">{c.parcel.title}</div>
                      <div className="mt-1 text-xs text-slate">{ACCESS_LABEL[c.accessType]}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={c.status} />
                        <span className="text-xs text-slate">
                          {c.offers.length ? gbp(latestOffer(c.offers)) : "—"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl bg-white hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream/80 text-xs uppercase tracking-[0.14em] text-slate">
              <tr>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Parcel</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Latest</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${c.id}`} className="font-semibold text-forest">
                      {c.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.parcel.title}</td>
                  <td className="px-4 py-3">
                    {PROJECTS.find((p) => p.id === c.projectId)?.code}
                  </td>
                  <td className="px-4 py-3">{c.owner.name}</td>
                  <td className="px-4 py-3">
                    {c.offers.length ? gbp(latestOffer(c.offers)) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
