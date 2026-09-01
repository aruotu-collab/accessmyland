"use client";

import Link from "next/link";
import { ParcelMap } from "@/components/ParcelMap";
import { StatusBadge } from "@/components/StatusBadge";
import { gbp, formatDateTime } from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";
import { nextAction } from "@/lib/workflow";
import { latestOffer } from "@/lib/format";

export default function DashboardPage() {
  const { user, cases, activity } = useStore();
  if (!user) return null;

  const visible =
    user.role === "landowner"
      ? cases.filter((c) => c.owner.userId === user.id)
      : user.role === "agent"
        ? cases.filter(
            (c) => c.assignedAgentId === "ag-whitfield" || c.status === "marketplace",
          )
        : cases;

  const open = visible.filter((c) => c.status !== "closed");
  const negotiating = visible.filter((c) =>
    ["offer_made", "negotiating"].includes(c.status),
  );
  const visits = visible.filter((c) => c.status === "visit_scheduled");
  const committed = visible
    .filter((c) => c.status !== "closed" && c.offers.length)
    .reduce((s, c) => s + latestOffer(c.offers), 0);
  const attention = visible
    .filter((c) => c.status !== "closed")
    .slice()
    .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity))
    .slice(0, 6);
  const feed =
    user.role === "landowner"
      ? activity.filter((a) => visible.some((c) => c.id === a.caseId))
      : activity;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {user.org}
        </p>
        <h1 className="mt-1 font-serif text-4xl text-forest">
          {user.role === "landowner"
            ? "Requests on your land"
            : user.role === "agent"
              ? "Your access caseload"
              : "Land access, this week"}
        </h1>
        <p className="mt-2 max-w-2xl text-slate">
          {user.role === "operator"
            ? "Keep files moving. The East Coast GI corridor is the live programme; Ellis Farm is the negotiation to watch."
            : user.role === "agent"
              ? "Claim marketplace work, then take it from first contact through to payment."
              : "Review terms, counter if you need to, and sign when you are ready."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "Open cases", v: String(open.length) },
          { l: "In negotiation", v: String(negotiating.length) },
          { l: "Visits scheduled", v: String(visits.length) },
          { l: "Compensation in play", v: gbp(committed) },
        ].map((k) => (
          <div key={k.l} className="rounded-2xl bg-white p-5 hairline">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">{k.l}</div>
            <div className="mt-2 font-serif text-3xl text-forest">{k.v}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-forest">Needs a decision</h2>
          <div className="divide-y divide-line overflow-hidden rounded-2xl bg-white hairline">
            {attention.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-cream/60"
              >
                <div>
                  <div className="text-sm font-semibold text-forest">{c.ref}</div>
                  <div className="text-sm text-slate">{c.parcel.title}</div>
                </div>
                <StatusBadge status={c.status} />
                <div className="w-full text-xs text-slate sm:w-auto sm:text-right">
                  {nextAction(c.status, user.role)}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-forest">Working map</h2>
          <ParcelMap cases={visible} height="h-[320px]" />
        </div>
      </div>

      {user.role !== "landowner" && (
        <div>
          <h2 className="font-serif text-2xl text-forest">Programmes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {PROJECTS.map((p) => {
              const pcs = cases.filter((c) => c.projectId === p.id);
              const live = pcs.filter((c) => c.status !== "closed").length;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-2xl bg-white p-5 hairline hover:border-forest"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-brass-deep">
                    {p.code}
                  </div>
                  <div className="mt-1 font-serif text-xl text-forest">{p.name}</div>
                  <div className="mt-2 text-sm text-slate">
                    {live} open · {pcs.length} parcels · {p.county}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl text-forest">Activity</h2>
        <ul className="mt-4 space-y-3">
          {feed.slice(0, 8).map((a) => (
            <li key={a.id} className="flex gap-4 text-sm">
              <span className="w-36 shrink-0 text-slate">{formatDateTime(a.at)}</span>
              <span className="text-forest">{a.text}</span>
              <span className="text-slate">· {a.by}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
