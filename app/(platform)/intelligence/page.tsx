"use client";

import { BENCHMARKS } from "@/lib/benchmarks";
import { ACCESS_LABEL, LAND_LABEL, gbp, openingOffer, settledAmount } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function IntelligencePage() {
  const { cases } = useStore();
  const settled = cases.filter((c) => settledAmount(c.offers, c.status) != null);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl text-forest">Compensation intelligence</h1>
        <p className="mt-2 max-w-2xl text-slate">
          Once you have processed enough agreements you know what was offered,
          countered and accepted. This is the product that becomes more valuable
          than the workflow itself.
        </p>
      </div>

      <div className="rounded-3xl bg-forest-deep p-8 text-cream">
        <p className="text-xs uppercase tracking-[0.2em] text-brass">Worked example</p>
        <p className="mt-3 font-serif text-3xl sm:text-4xl">
          Similar GI access cases in Lincolnshire have settled at a median {gbp(780)}.
        </p>
        <p className="mt-4 max-w-2xl text-cream/75">
          Ellis Farm opened at {gbp(650)} and is now at {gbp(780)} — exactly the
          county median for a GI borehole on arable. That is the number you send
          with confidence, not a guess from the last job you remember.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/80 text-xs uppercase tracking-[0.14em] text-slate">
            <tr>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Land</th>
              <th className="px-4 py-3">County</th>
              <th className="px-4 py-3">n</th>
              <th className="px-4 py-3">P25</th>
              <th className="px-4 py-3">Median</th>
              <th className="px-4 py-3">P75</th>
            </tr>
          </thead>
          <tbody>
            {BENCHMARKS.map((b, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-4 py-3">{ACCESS_LABEL[b.accessType]}</td>
                <td className="px-4 py-3">{LAND_LABEL[b.landUse]}</td>
                <td className="px-4 py-3">{b.county}</td>
                <td className="px-4 py-3">{b.samples}</td>
                <td className="px-4 py-3">{gbp(b.p25)}</td>
                <td className="px-4 py-3 font-semibold text-forest">{gbp(b.median)}</td>
                <td className="px-4 py-3">{gbp(b.p75)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="font-serif text-2xl text-forest">Settled on this workspace</h2>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white hairline">
          <table className="w-full text-left text-sm">
            <thead className="bg-cream/80 text-xs uppercase tracking-[0.14em] text-slate">
              <tr>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Opened</th>
                <th className="px-4 py-3">Settled</th>
                <th className="px-4 py-3">Lift</th>
              </tr>
            </thead>
            <tbody>
              {settled.map((c) => {
                const open = openingOffer(c.offers);
                const set = settledAmount(c.offers, c.status) ?? 0;
                const lift = open ? Math.round(((set - open) / open) * 100) : 0;
                return (
                  <tr key={c.id} className="border-t border-line">
                    <td className="px-4 py-3">{c.ref}</td>
                    <td className="px-4 py-3">{open ? gbp(open) : "—"}</td>
                    <td className="px-4 py-3">{gbp(set)}</td>
                    <td className="px-4 py-3">{lift > 0 ? `+${lift}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
