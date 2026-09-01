"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ParcelMap } from "@/components/ParcelMap";
import { StatusBadge } from "@/components/StatusBadge";
import { findBenchmark, suggestedOpening } from "@/lib/benchmarks";
import {
  ACCESS_LABEL,
  LAND_LABEL,
  formatDate,
  formatDateTime,
  gbp,
  latestOffer,
} from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";
import type { OfferFrom } from "@/lib/types";
import { PIPELINE, nextAction, statusIndex } from "@/lib/workflow";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const store = useStore();
  const c = store.getCase(params.id);
  const user = store.user;
  const [amount, setAmount] = useState("");
  const [conditions, setConditions] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [visitDate, setVisitDate] = useState("2026-09-14");
  const [evidence, setEvidence] = useState("Entry photograph — gateway");
  const [damage, setDamage] = useState("");
  const [damageAmt, setDamageAmt] = useState("0");
  const [fee, setFee] = useState("500");

  if (!c || !user) return <p>Case not found.</p>;

  const project = PROJECTS.find((p) => p.id === c.projectId);
  const bench = findBenchmark(c.accessType, c.parcel.landUse, c.parcel.county);
  const idx = statusIndex(c.status);
  const from: OfferFrom = user.role === "landowner" ? "landowner" : user.role === "agent" ? "agent" : "operator";
  const canAct = user.role !== "landowner" || c.owner.userId === user.id;
  const suggest = suggestedOpening(c.accessType, c.parcel.landUse, c.parcel.county);
  const last = latestOffer(c.offers);

  function submitOffer() {
    const n = Number(amount);
    if (!n) return;
    store.addOffer(c!.id, n, conditions || "As discussed.", from);
    setAmount("");
    setConditions("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/cases" className="text-xs uppercase tracking-[0.16em] text-brass-deep">
            All cases
          </Link>
          <h1 className="mt-1 font-serif text-4xl text-forest">{c.ref}</h1>
          <p className="mt-1 text-slate">
            {c.parcel.title} · {project?.name} · {ACCESS_LABEL[c.accessType]}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={c.status} />
          <span className="text-sm text-slate">{nextAction(c.status, user.role)}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <ol className="flex min-w-[720px] gap-1">
          {PIPELINE.map((s, i) => (
            <li
              key={s}
              className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-forest" : "bg-line"}`}
              title={s}
            />
          ))}
        </ol>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 hairline">
            <h2 className="font-serif text-2xl text-forest">Negotiation</h2>
            {c.offers.length === 0 ? (
              <p className="mt-3 text-sm text-slate">No offers yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {c.offers.map((o) => (
                  <li key={o.id} className="rounded-xl bg-cream/70 px-4 py-3">
                    <div className="flex justify-between gap-4">
                      <span className="text-sm font-medium text-forest">
                        {o.author} · {o.from}
                      </span>
                      <span className="font-serif text-xl text-forest">{gbp(o.amount)}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate">{o.conditions}</p>
                    <p className="mt-1 text-xs text-slate">{formatDateTime(o.at)}</p>
                  </li>
                ))}
              </ul>
            )}

            {canAct &&
              ["contacted", "offer_made", "negotiating", "owner_identified"].includes(c.status) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-[140px_1fr_auto]">
                  <input
                    type="number"
                    placeholder={user.role === "landowner" ? "Counter £" : `Offer · try ${gbp(suggest)}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                  />
                  <input
                    placeholder="Conditions"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-forest"
                  />
                  <button
                    onClick={submitOffer}
                    className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-cream"
                  >
                    {user.role === "landowner" ? "Counter" : "Send offer"}
                  </button>
                </div>
              )}

            {canAct && user.role !== "landowner" && ["offer_made", "negotiating"].includes(c.status) && (
              <button
                onClick={() => store.acceptTerms(c.id)}
                className="mt-4 rounded-full bg-brass px-4 py-2 text-sm font-semibold text-forest-deep"
              >
                Mark terms agreed at {last ? gbp(last) : "current offer"}
              </button>
            )}
            {canAct && user.role === "landowner" && ["offer_made", "negotiating"].includes(c.status) && last > 0 && (
              <button
                onClick={() => store.acceptTerms(c.id)}
                className="mt-4 rounded-full border border-forest px-4 py-2 text-sm font-semibold text-forest"
              >
                Accept {gbp(last)}
              </button>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 hairline">
            <h2 className="font-serif text-2xl text-forest">Conditions</h2>
            {c.conditions.length === 0 ? (
              <p className="mt-3 text-sm text-slate">Conditions will attach when terms settle.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {c.conditions.map((cd) => (
                  <li key={cd.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={cd.agreed}
                        onChange={() => store.toggleCondition(c.id, cd.id)}
                        className="mt-1"
                      />
                      <span className={cd.agreed ? "text-forest" : "text-slate"}>{cd.text}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 hairline">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl text-forest">Access licence</h2>
              {c.licenceGeneratedAt && (
                <Link href={`/licence/${c.id}`} className="text-sm font-semibold text-brass-deep">
                  Open licence
                </Link>
              )}
            </div>
            <p className="mt-2 text-sm text-slate">
              Operator signed: {c.signedByOperator ? "yes" : "no"} · Landowner signed:{" "}
              {c.signedByOwner ? "yes" : "no"}
              {c.licenceGeneratedAt ? ` · Generated ${formatDate(c.licenceGeneratedAt)}` : ""}
            </p>
            {canAct && user.role !== "landowner" && c.status === "terms_agreed" && (
              <button
                onClick={() => store.generateLicence(c.id)}
                className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
              >
                Generate licence
              </button>
            )}
            {canAct && c.status === "licence_generated" && (
              <button
                onClick={() => store.signLicence(c.id)}
                className="mt-4 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
              >
                Sign as {user.role}
              </button>
            )}
          </section>

          <section className="rounded-2xl bg-white p-6 hairline">
            <h2 className="font-serif text-2xl text-forest">Visit, evidence, damage, pay</h2>
            {c.visit && (
              <p className="mt-2 text-sm text-slate">
                {formatDate(c.visit.date)} · {c.visit.window} · {c.visit.team}
              </p>
            )}
            {canAct && user.role !== "landowner" && c.status === "signed" && (
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  onClick={() => store.scheduleVisit(c.id, visitDate, "07:00–17:00", "Field crew")}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                >
                  Schedule visit
                </button>
              </div>
            )}
            {c.evidence.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-slate">
                {c.evidence.map((e) => (
                  <li key={e.id}>
                    {e.label} · {formatDateTime(e.at)} · {e.by}
                  </li>
                ))}
              </ul>
            )}
            {canAct && user.role !== "landowner" && c.status === "visit_scheduled" && (
              <div className="mt-4 flex gap-2">
                <input
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  onClick={() => store.addEvidence(c.id, evidence)}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                >
                  Add evidence
                </button>
              </div>
            )}
            {c.damage && (
              <p className="mt-3 text-sm text-clay">
                {c.damage.description} · {gbp(c.damage.estimate)}
              </p>
            )}
            {canAct && user.role !== "landowner" && c.status === "access_evidenced" && (
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_100px_auto]">
                <input
                  placeholder="Damage (blank if none)"
                  value={damage}
                  onChange={(e) => setDamage(e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  value={damageAmt}
                  onChange={(e) => setDamageAmt(e.target.value)}
                  className="rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  onClick={() => store.recordDamage(c.id, damage, Number(damageAmt) || 0)}
                  className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
                >
                  Record & move to pay
                </button>
              </div>
            )}
            {canAct &&
              user.role !== "landowner" &&
              ["damage_recorded", "payment_pending"].includes(c.status) && (
                <button
                  onClick={() => store.markPaid(c.id)}
                  className="mt-4 rounded-full bg-brass px-4 py-2 text-sm font-semibold text-forest-deep"
                >
                  Mark compensation paid
                </button>
              )}
            {c.paidAt && (
              <p className="mt-3 text-sm text-forest">
                Paid {gbp(c.paidAmount ?? 0)} on {formatDate(c.paidAt)}
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <ParcelMap cases={[c]} highlightId={c.id} height="h-[220px]" />
          <div className="rounded-2xl bg-white p-5 hairline">
            <h3 className="text-xs uppercase tracking-[0.16em] text-slate">Parcel</h3>
            <p className="mt-2 font-medium text-forest">{c.parcel.title}</p>
            <p className="text-sm text-slate">
              {c.parcel.osGrid} · {c.parcel.areaHa} ha · {LAND_LABEL[c.parcel.landUse]}
            </p>
            <p className="mt-2 text-sm text-slate">{c.disturbance}</p>
            <p className="mt-1 text-sm text-slate">{c.cropImpact}</p>
            <p className="mt-1 text-sm text-slate">{c.durationDays} day access</p>
          </div>
          <div className="rounded-2xl bg-white p-5 hairline">
            <h3 className="text-xs uppercase tracking-[0.16em] text-slate">Parties</h3>
            <p className="mt-2 font-medium text-forest">{c.owner.name}</p>
            <p className="text-sm text-slate">{c.owner.email || "No email yet"}</p>
            {c.owner.phone && <p className="text-sm text-slate">{c.owner.phone}</p>}
            {user.role !== "landowner" && c.status === "identifying" && (
              <div className="mt-3 space-y-2">
                <input
                  placeholder="Owner name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  onClick={() => ownerName && store.identifyOwner(c.id, ownerName)}
                  className="w-full rounded-full bg-forest py-2 text-sm font-semibold text-cream"
                >
                  Confirm owner
                </button>
              </div>
            )}
            {user.role !== "landowner" && c.status === "owner_identified" && (
              <button
                onClick={() => store.contactOwner(c.id)}
                className="mt-3 w-full rounded-full bg-forest py-2 text-sm font-semibold text-cream"
              >
                Log first contact
              </button>
            )}
          </div>
          {bench && (
            <div className="rounded-2xl bg-forest-deep p-5 text-cream">
              <h3 className="text-xs uppercase tracking-[0.16em] text-brass">Intelligence</h3>
              <p className="mt-2 font-serif text-3xl">{gbp(bench.median)}</p>
              <p className="mt-1 text-sm text-cream/75">
                Median {ACCESS_LABEL[c.accessType]} on {LAND_LABEL[c.parcel.landUse].toLowerCase()} in{" "}
                {c.parcel.county} · {bench.samples} settled files · IQR {gbp(bench.p25)}–{gbp(bench.p75)}
              </p>
              {c.offers[0] && (
                <p className="mt-3 text-sm">
                  You opened at {gbp(c.offers[0].amount)}. Files like this typically settle around{" "}
                  {Math.round(bench.openToSettle * 100 - 100)}% above the opening number.
                </p>
              )}
            </div>
          )}
          {user.role === "operator" &&
            !["closed", "marketplace", "payment_pending"].includes(c.status) &&
            !c.assignedAgentId && (
              <div className="rounded-2xl bg-white p-5 hairline">
                <h3 className="text-xs uppercase tracking-[0.16em] text-slate">Out of capacity?</h3>
                <p className="mt-2 text-sm text-slate">
                  List this case for an independent agent. Platform takes 15%.
                </p>
                <input
                  type="number"
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  className="mt-3 w-full rounded-lg border border-line px-3 py-2 text-sm"
                />
                <button
                  onClick={() => store.listMarketplace(c.id, Number(fee) || 500)}
                  className="mt-2 w-full rounded-full bg-clay py-2 text-sm font-semibold text-cream"
                >
                  List on marketplace
                </button>
              </div>
            )}
        </aside>
      </div>
    </div>
  );
}
