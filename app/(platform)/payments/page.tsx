"use client";

import Link from "next/link";
import { gbp, formatDate, latestOffer } from "@/lib/format";
import { useStore } from "@/lib/store";

export default function PaymentsPage() {
  const { user, cases, reset } = useStore();
  const paid = cases.filter((c) => c.paidAt);
  const due = cases.filter((c) => ["payment_pending", "damage_recorded"].includes(c.status));
  const market = cases.filter((c) => c.marketplaceFee);
  const paidTotal = paid.reduce((s, c) => s + (c.paidAmount ?? 0), 0);
  const dueTotal = due.reduce((s, c) => {
    const base = latestOffer(c.offers);
    return s + base + (c.damage?.estimate ?? 0);
  }, 0);
  const commission = market.reduce((s, c) => s + (c.marketplaceFee ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-forest">Payments</h1>
          <p className="mt-2 max-w-2xl text-slate">
            Compensation to landowners, plus marketplace commission. In this demo
            the ledger is local to your browser.
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
        <div className="rounded-2xl bg-white p-5 hairline">
          <div className="text-xs uppercase tracking-[0.16em] text-slate">Paid</div>
          <div className="mt-2 font-serif text-3xl text-forest">{gbp(paidTotal)}</div>
        </div>
        <div className="rounded-2xl bg-white p-5 hairline">
          <div className="text-xs uppercase tracking-[0.16em] text-slate">Due</div>
          <div className="mt-2 font-serif text-3xl text-forest">{gbp(dueTotal)}</div>
        </div>
        <div className="rounded-2xl bg-white p-5 hairline">
          <div className="text-xs uppercase tracking-[0.16em] text-slate">Marketplace 15%</div>
          <div className="mt-2 font-serif text-3xl text-forest">{gbp(commission)}</div>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white hairline">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream/80 text-xs uppercase tracking-[0.14em] text-slate">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Landowner</th>
              <th className="px-4 py-3">Compensation</th>
              <th className="px-4 py-3">Damage</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...due, ...paid].map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/cases/${c.id}`} className="font-semibold text-forest">
                    {c.ref}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.owner.name}</td>
                <td className="px-4 py-3">{gbp(c.paidAmount ?? latestOffer(c.offers))}</td>
                <td className="px-4 py-3">{c.damage ? gbp(c.damage.estimate) : "—"}</td>
                <td className="px-4 py-3">
                  {c.paidAt ? `Paid ${formatDate(c.paidAt)}` : "Awaiting payment"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {user?.role === "landowner" && (
        <p className="text-sm text-slate">
          You only see files where you are the owner. Ellis Farm is the live
          negotiation.
        </p>
      )}
    </div>
  );
}
