"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "./Logo";
import {
  IconBank,
  IconBrief,
  IconChart,
  IconGrid,
  IconLogout,
  IconMap,
  IconUsers,
} from "./icons";
import { PROJECTS, useStore } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: IconGrid, roles: ["operator", "agent", "landowner"] },
  { href: "/projects", label: "Projects", icon: IconBrief, roles: ["operator", "agent"] },
  { href: "/cases", label: "Cases", icon: IconGrid, roles: ["operator", "agent", "landowner"] },
  { href: "/map", label: "Map", icon: IconMap, roles: ["operator", "agent"] },
  { href: "/marketplace", label: "Marketplace", icon: IconUsers, roles: ["operator", "agent"] },
  { href: "/intelligence", label: "Intelligence", icon: IconChart, roles: ["operator", "agent"] },
  { href: "/payments", label: "Payments", icon: IconBank, roles: ["operator", "agent", "landowner"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-slate">
        Loading workspace…
      </div>
    );
  }

  const items = NAV.filter((n) => n.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-paper">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-line bg-forest-deep text-cream lg:flex">
        <div className="px-5 py-5">
          <Logo className="[&_span]:text-cream" />
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "bg-white/10 text-brass"
                    : "text-cream/75 hover:bg-white/5 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="text-xs uppercase tracking-[0.16em] text-brass/80">
            Signed in as
          </div>
          <div className="mt-1 font-medium">{user.name}</div>
          <div className="text-xs text-cream/60">{user.org}</div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="mt-3 flex items-center gap-2 text-xs text-cream/60 hover:text-brass"
          >
            <IconLogout className="h-3.5 w-3.5" /> Switch role
          </button>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="lg:hidden">
            <Logo markClass="h-7 w-7" />
          </div>
          <div className="hidden text-sm text-slate lg:block">
            {user.role === "operator"
              ? `${PROJECTS.length} live projects · Lincolnshire`
              : user.role === "agent"
                ? "Independent land agent workspace"
                : "Your land, your terms"}
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-forest">
              Demo · stored in this browser
            </span>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-xs font-medium text-slate hover:text-forest"
            >
              Switch role
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-xs font-semibold text-cream">
              {user.initials}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 pb-24 sm:px-8 sm:py-8 lg:pb-8">{children}</main>
        <nav className="no-print fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-line bg-paper px-2 py-2 lg:hidden">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium ${
                  active ? "bg-forest text-cream" : "text-slate"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
