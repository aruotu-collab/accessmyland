"use client";

import Link from "next/link";
import { SECTOR_LABEL } from "@/lib/format";
import { PROJECTS, useStore } from "@/lib/store";

export default function ProjectsPage() {
  const { cases } = useStore();
  return (
    <div>
      <h1 className="font-serif text-4xl text-forest">Projects</h1>
      <p className="mt-2 max-w-2xl text-slate">
        Each programme is a bundle of third-party parcels. Open a project to see
        every access case on the route.
      </p>
      <div className="mt-8 space-y-4">
        {PROJECTS.map((p) => {
          const pcs = cases.filter((c) => c.projectId === p.id);
          const closed = pcs.filter((c) => c.status === "closed").length;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block rounded-2xl bg-white p-6 hairline hover:border-forest"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-brass-deep">
                    {p.code} · {SECTOR_LABEL[p.sector]}
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-forest">{p.name}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate">{p.description}</p>
                </div>
                <div className="text-right text-sm text-slate">
                  <div className="font-serif text-2xl text-forest">{pcs.length}</div>
                  parcels
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate">
                <span>{p.client}</span>
                <span>{p.county}</span>
                <span>
                  {closed} closed · {pcs.length - closed} live
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
