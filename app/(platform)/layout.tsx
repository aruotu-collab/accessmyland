"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, user, profileComplete } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profileComplete) router.replace("/welcome");
  }, [ready, user, profileComplete, router]);

  return <AppShell>{children}</AppShell>;
}
