export const maxDuration = 60;

import { runPlanningScan } from "@/lib/planning-scan";

function authorized(request: Request) {
  const cronHeader = request.headers.get("x-vercel-cron");
  if (cronHeader === "1") return true;
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const result = await runPlanningScan();
    return Response.json({
      ok: true,
      scanned: result.scanned,
      added: result.added,
      updated: result.updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";
    return Response.json({ error: message }, { status: 502 });
  }
}
