"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { ACCESS_LABEL, gbp } from "@/lib/format";
import { AGENTS, useStore } from "@/lib/store";

export default function MarketplacePage() {
  const { user, cases, claimCase } = useStore();
  const listed = cases.filter((c) => c.status === "marketplace");
  const assigned = cases.filter((c) => c.assignedAgentId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl text-forest">Agent marketplace</h1>
        <p className="mt-2 max-w-2xl text-slate">
          When the internal land team is full, a parcel becomes a job for an
          approved independent agent. Professional fee stays with the agent;
          AccessMyLand takes 15%.
        </p>
      </div>

      <section>
        <h2 className="font-serif text-2xl text-forest">Open for claim</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {listed.length === 0 && (
            <p className="text-sm text-slate">No cases on the market. List one from a live file.</p>
          )}
          {listed.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-5 hairline">
              <div className="flex items-start justify-between">
                <div>
                  <Link href={`/cases/${c.id}`} className="font-semibold text-forest">
                    {c.ref}
                  </Link>
                  <p className="text-sm text-slate">{c.parcel.title}</p>
                  <p className="mt-1 text-sm text-slate">{ACCESS_LABEL[c.accessType]}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate">Professional fee</div>
                  <div className="font-serif text-2xl text-forest">{gbp(c.professionalFee ?? 0)}</div>
                  <div className="text-xs text-slate">Platform {gbp(c.marketplaceFee ?? 0)}</div>
                </div>
                {user?.role === "agent" && (
                  <button
                    onClick={() => claimCase(c.id, "ag-whitfield")}
                    className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                  >
                    Claim case
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Approved agents</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {AGENTS.map((a) => (
            <div key={a.id} className="rounded-2xl bg-white p-5 hairline">
              <div className="flex justify-between">
                <div>
                  <div className="font-serif text-xl text-forest">{a.name}</div>
                  <div className="text-sm text-slate">{a.firm}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-forest">{a.rating.toFixed(1)}</div>
                  <div className="text-xs text-slate">{a.casesClosed} closed</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate">{a.counties.join(" · ")}</p>
              <p className="text-sm text-slate">{a.specialisms.join(" · ")}</p>
              <div className="mt-3 flex justify-between text-sm">
                <span className="capitalize text-brass-deep">{a.capacity}</span>
                <span>{gbp(a.dayRate)} / day</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Assigned from the market</h2>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl bg-white hairline">
          {assigned.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <Link href={`/cases/${c.id}`} className="font-medium text-forest">
                {c.ref} · {c.parcel.title}
              </Link>
              <span className="text-slate">
                {AGENTS.find((a) => a.id === c.assignedAgentId)?.name} · {gbp(c.professionalFee ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
