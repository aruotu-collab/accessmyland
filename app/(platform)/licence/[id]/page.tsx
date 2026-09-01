"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ACCESS_LABEL, LAND_LABEL, formatDate, gbp, latestOffer } from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";

export default function LicencePage() {
  const params = useParams<{ id: string }>();
  const { getCase } = useStore();
  const c = getCase(params.id);
  const project = PROJECTS.find((p) => p.id === c?.projectId);

  if (!c) return <p>Licence not found.</p>;
  const amount = latestOffer(c.offers);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href={`/cases/${c.id}`} className="text-sm text-brass-deep">
          ← Back to case
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream"
        >
          Print / save PDF
        </button>
      </div>
      <article className="rounded-2xl bg-white p-10 hairline print:border-0 print:shadow-none">
        <p className="text-xs uppercase tracking-[0.22em] text-brass-deep">
          AccessMyLand · Temporary access licence
        </p>
        <h1 className="mt-3 font-serif text-4xl text-forest">Licence to enter land</h1>
        <p className="mt-2 text-sm text-slate">
          {c.ref} · Generated {c.licenceGeneratedAt ? formatDate(c.licenceGeneratedAt) : "draft"}
        </p>
        <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink">
          <p>
            This licence is granted by <strong>{c.owner.name}</strong> (the Landowner) to{" "}
            <strong>{project?.client ?? "the Operator"}</strong> (the Operator) to enter the land
            known as <strong>{c.parcel.title}</strong> ({c.parcel.osGrid}, {c.parcel.areaHa} ha,{" "}
            {LAND_LABEL[c.parcel.landUse].toLowerCase()}) for the purpose of{" "}
            {ACCESS_LABEL[c.accessType].toLowerCase()}.
          </p>
          <p>
            The right of entry is temporary, lasting {c.durationDays}{" "}
            {c.durationDays === 1 ? "day" : "days"}, and does not create an easement, tenancy or
            wayleave capable of registration.
          </p>
          <p>
            <strong>Works.</strong> {c.disturbance}
          </p>
          <p>
            <strong>Crop and land.</strong> {c.cropImpact}
          </p>
          <p>
            <strong>Compensation.</strong> The Operator shall pay {gbp(amount)}
            {c.damage ? `, plus ${gbp(c.damage.estimate)} in respect of recorded damage` : ""}{" "}
            within 14 days of completion of the works.
          </p>
          {c.conditions.length > 0 && (
            <div>
              <strong>Conditions.</strong>
              <ol className="mt-2 list-decimal pl-5">
                {c.conditions.map((cd) => (
                  <li key={cd.id}>{cd.text}</li>
                ))}
              </ol>
            </div>
          )}
          <p>
            The Operator shall hold public liability insurance of not less than £5 million,
            issue RAMS before entry, and reinstate the land to the Landowner’s reasonable
            satisfaction.
          </p>
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div className="border-t border-line pt-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">Operator</div>
            <div className="mt-2 font-serif text-xl text-forest">
              {c.signedByOperator ? "Signed electronically" : "Awaiting signature"}
            </div>
            <div className="text-sm text-slate">{project?.client}</div>
          </div>
          <div className="border-t border-line pt-4">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">Landowner</div>
            <div className="mt-2 font-serif text-xl text-forest">
              {c.signedByOwner ? "Signed electronically" : "Awaiting signature"}
            </div>
            <div className="text-sm text-slate">{c.owner.name}</div>
          </div>
        </div>
        <p className="mt-10 text-xs text-slate">
          Demonstration document produced by AccessMyLand. Not legal advice. A production
          licence would be issued under your organisation’s approved precedent.
        </p>
      </article>
    </div>
  );
}
