"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ParcelMap } from "@/components/ParcelMap";
import { StatusBadge } from "@/components/StatusBadge";
import { ACCESS_LABEL, SECTOR_LABEL, gbp, latestOffer } from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { cases } = useStore();
  const project = PROJECTS.find((p) => p.id === params.id);
  if (!project) return <p>Project not found.</p>;
  const pcs = cases.filter((c) => c.projectId === project.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-brass-deep">
          {project.code} · {SECTOR_LABEL[project.sector]}
        </p>
        <h1 className="mt-1 font-serif text-4xl text-forest">{project.name}</h1>
        <p className="mt-2 max-w-2xl text-slate">{project.description}</p>
        <p className="mt-2 text-sm text-slate">
          {project.client} · {project.county}
        </p>
      </div>
      <ParcelMap cases={pcs} height="h-[360px]" />
      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/80 text-xs uppercase tracking-[0.14em] text-slate">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Parcel</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Offer</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pcs.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/cases/${c.id}`} className="font-semibold text-forest hover:text-brass-deep">
                    {c.ref}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.parcel.title}</td>
                <td className="px-4 py-3">{ACCESS_LABEL[c.accessType]}</td>
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
    </div>
  );
}
