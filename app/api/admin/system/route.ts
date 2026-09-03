import { requireAdmin } from "@/lib/admin-guard";
import { visitStats } from "@/lib/admin-store";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const stats = await visitStats();
  return Response.json({
    env: {
      authSecret: Boolean(process.env.AUTH_SECRET),
      resend: Boolean(process.env.RESEND_API_KEY),
      fromAddress: Boolean(process.env.RESEND_FROM),
      appUrl: Boolean(process.env.APP_URL),
      analytics: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    },
    runtime: process.env.VERCEL ? "vercel" : "local",
    stats,
  });
}
