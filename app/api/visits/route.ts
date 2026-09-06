export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/admin-guard";
import { recordVisit } from "@/lib/admin-store";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";
import { parseUserAgent, requestPlace } from "@/lib/visit";

function safePath(value: unknown) {
  if (typeof value !== "string") return "";
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "";
  }
  return path.slice(0, 300);
}

function safeReferrer(value: unknown) {
  if (typeof value !== "string") return "";
  return value.slice(0, 400);
}

export async function POST(request: Request) {
  let body: { path?: string; referrer?: string } = {};
  try {
    body = (await request.json()) as { path?: string; referrer?: string };
  } catch {
    return Response.json({ error: "Invalid visit." }, { status: 400 });
  }

  const path = safePath(body.path);
  if (!path || path.startsWith("/api/") || path.startsWith("/_next")) {
    return Response.json({ ok: true, skipped: true });
  }

  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  const place = requestPlace(request);
  const ua = request.headers.get("user-agent") ?? "";
  const parsed = parseUserAgent(ua);

  await recordVisit({
    path,
    referrer: safeReferrer(body.referrer),
    ip: place.ip,
    country: place.country,
    countryCode: place.countryCode,
    region: place.region,
    city: place.city,
    latitude: place.latitude,
    longitude: place.longitude,
    userAgent: ua.slice(0, 400),
    device: parsed.device,
    browser: parsed.browser,
    email: session?.email ?? "",
  });

  return Response.json({ ok: true });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });
  const { listVisits } = await import("@/lib/admin-store");
  return Response.json({ visits: await listVisits() });
}
