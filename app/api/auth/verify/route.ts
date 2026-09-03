import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordAccountEvent } from "@/lib/admin-store";
import {
  PROFILE_COOKIE,
  SESSION_COOKIE,
  appUrl,
  createSessionToken,
  readMagicToken,
  readProfileToken,
  readSessionToken,
  resolveSignInProfile,
  sessionCookieOptions,
} from "@/lib/auth";
import { requestPlace } from "@/lib/visit";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = readMagicToken(token);
  const base = appUrl(request);

  if (!email) {
    return NextResponse.redirect(`${base}/login?error=invalid`);
  }

  const jar = await cookies();
  const profile = resolveSignInProfile(
    email,
    readSessionToken(jar.get(SESSION_COOKIE)?.value),
    readProfileToken(jar.get(PROFILE_COOKIE)?.value),
  );

  const next = profile.profileComplete ? "/dashboard" : "/welcome";
  const response = NextResponse.redirect(`${base}${next}`);
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(email, profile),
    sessionCookieOptions(),
  );
  const place = requestPlace(request);
  await recordAccountEvent({
    kind: "sign_in",
    email,
    ip: place.ip,
    city: place.city,
    country: place.country,
  });
  return response;
}
