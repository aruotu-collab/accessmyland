export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/admin-guard";
import { ensureAccount, listAccounts, listEvents, visitStats } from "@/lib/admin-store";
import { requestPlace } from "@/lib/visit";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const place = requestPlace(request);
  await ensureAccount({
    email: admin.email,
    ip: place.ip,
    city: place.city,
    country: place.country,
    name: admin.name,
    org: admin.org,
  });

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
