"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/visits", label: "Web visits" },
  { href: "/admin/accounts", label: "Accounts" },
  { href: "/admin/deals", label: "Deal watch" },
  { href: "/admin/workspace", label: "Workspace" },
  { href: "/admin/system", label: "System" },
];

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, sessionUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!sessionUser?.isAdmin) router.replace("/dashboard");
  }, [ready, sessionUser, router]);

  if (!ready || !sessionUser?.isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate">
        Checking administrator access…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                active
                  ? "bg-forest text-cream"
                  : "bg-white text-slate hairline hover:text-forest"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
