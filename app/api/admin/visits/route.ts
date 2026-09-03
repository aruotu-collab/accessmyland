import { requireAdmin } from "@/lib/admin-guard";
import { clearVisits, listVisits } from "@/lib/admin-store";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ visits: await listVisits() });
}

export async function DELETE() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  await clearVisits();
  return Response.json({ ok: true });
}
