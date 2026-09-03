"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDateTime, gbp, latestOffer } from "@/lib/format";
import { PROJECTS, USERS, useStore } from "@/lib/store";

export default function AdminWorkspacePage() {
  const { cases, activity, reset } = useStore();
  const open = cases.filter((item) => item.status !== "closed");
  const marketplace = cases.filter((item) => item.status === "marketplace");
  const compensation = cases
    .filter((item) => item.status !== "closed" && item.offers.length)
    .reduce((sum, item) => sum + latestOffer(item.offers), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-forest">Workspace</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Case files in this browser. Reset returns the demo programmes to
            their starting state.
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-full border border-line px-4 py-2 text-sm text-slate hover:border-forest hover:text-forest"
        >
          Reset demo data
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Open cases", v: String(open.length) },
          { l: "On marketplace", v: String(marketplace.length) },
          { l: "Compensation in play", v: gbp(compensation) },
        ].map((card) => (
          <div key={card.l} className="rounded-2xl bg-white p-5 hairline">
            <div className="text-xs uppercase tracking-[0.16em] text-slate">
              {card.l}
            </div>
            <div className="mt-2 font-serif text-3xl text-forest">{card.v}</div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-serif text-2xl text-forest">Demo seats</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {USERS.map((person) => (
            <div key={person.id} className="rounded-2xl bg-white p-4 hairline">
              <div className="font-medium text-forest">{person.name}</div>
              <div className="text-sm text-slate">{person.title}</div>
              <div className="mt-2 text-xs text-slate">{person.email}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Projects</h2>
        <ul className="mt-4 space-y-2">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex justify-between rounded-2xl bg-white px-4 py-3 hairline hover:border-forest"
              >
                <span className="font-medium text-forest">{project.name}</span>
                <span className="text-sm text-slate">
                  {project.caseIds.length} cases · {project.county}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Cases</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white hairline">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-[0.14em] text-slate">
              <tr>
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Parcel</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Offer</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/cases/${item.id}`} className="font-medium text-forest">
                      {item.ref}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate">{item.parcel.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-slate">{item.owner.name}</td>
                  <td className="px-4 py-3 text-slate">
                    {item.offers.length ? gbp(latestOffer(item.offers)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-forest">Recent case activity</h2>
        <ul className="mt-4 space-y-2 rounded-2xl bg-white p-5 hairline">
          {activity.slice(0, 12).map((item) => (
            <li key={item.id} className="flex justify-between gap-3 text-sm">
              <span className="text-forest">{item.text}</span>
              <span className="shrink-0 text-xs text-slate">
                {formatDateTime(item.at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
