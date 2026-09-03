import { requireAdmin } from "@/lib/admin-guard";
import { listAccounts, listEvents } from "@/lib/admin-store";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const [accounts, events] = await Promise.all([listAccounts(), listEvents()]);
  return Response.json({ accounts, events });
}
