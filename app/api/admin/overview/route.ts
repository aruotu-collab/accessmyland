import { requireAdmin } from "@/lib/admin-guard";
import { listAccounts, listEvents, visitStats } from "@/lib/admin-store";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const [stats, accounts, events] = await Promise.all([
    visitStats(),
    listAccounts(),
    listEvents(),
  ]);

  return Response.json({
    stats,
    recentAccounts: accounts.slice(0, 8),
    recentEvents: events.slice(0, 10),
  });
}
