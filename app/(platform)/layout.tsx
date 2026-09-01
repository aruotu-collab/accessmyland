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
  const { ready, user } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  return <AppShell>{children}</AppShell>;
}
