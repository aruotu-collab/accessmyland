"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ROLE_LABEL } from "@/lib/format";
import { USERS, useStore } from "@/lib/store";

const BLURB = {
  operator:
    "Run the East Coast GI corridor, Fenland Solar and the 132kV diversion. Negotiate Ellis Farm, list overflow on the marketplace.",
  agent:
    "You have already claimed Billingborough. Pick up Ancaster ridge from the marketplace and move files to licence.",
  landowner:
    "You are Margaret Ellis. Review the £780 revised offer on your north arable, counter, or sign when terms land.",
};

export default function LoginPage() {
  const { login, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8">
        <Logo />
        <div className="my-auto grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass-deep">
              Live demo · no password
            </p>
            <h1 className="mt-4 font-serif text-5xl text-forest">
              Choose a seat at the table.
            </h1>
            <p className="mt-4 max-w-md text-slate">
              The same Lincolnshire programme, three vantage points. Data stays in
              this browser. Reset it from Payments if you want a clean slate.
            </p>
          </div>
          <div className="space-y-3">
            {USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => login(u.id)}
                className="w-full rounded-2xl border border-line bg-white/80 p-5 text-left transition hover:border-forest hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif text-xl text-forest">{u.name}</div>
                    <div className="text-sm text-slate">
                      {u.title} · {u.org}
                    </div>
                  </div>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest">
                    {ROLE_LABEL[u.role]}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate">{BLURB[u.role]}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
