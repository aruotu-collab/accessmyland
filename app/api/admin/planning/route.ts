export const maxDuration = 60;

import { requireAdmin } from "@/lib/admin-guard";
import { listPlanning, setPlanningStatus } from "@/lib/admin-store";
import { runPlanningScan } from "@/lib/planning-scan";
import type { DealSuggestion } from "@/lib/planning-watch";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json(await listPlanning());
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  try {
    const result = await runPlanningScan();
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  let body: { id?: string; status?: DealSuggestion["status"] } = {};
  try {
    body = (await request.json()) as { id?: string; status?: DealSuggestion["status"] };
  } catch {
    return Response.json({ error: "Invalid update." }, { status: 400 });
  }
  const allowed = ["new", "dismissed", "opened"] as const;
  if (!body.id || !body.status || !allowed.includes(body.status)) {
    return Response.json({ error: "Choose a suggestion and status." }, { status: 400 });
  }
  const row = await setPlanningStatus(body.id, body.status);
  if (!row) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ suggestion: row });
}
