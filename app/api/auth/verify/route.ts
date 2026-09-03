import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccountProfile, recordAccountEvent } from "@/lib/admin-store";
import {
  PROFILE_COOKIE,
  SESSION_COOKIE,
  appUrl,
  createProfileToken,
  createSessionToken,
  readMagicToken,
  readProfileToken,
  readSessionToken,
  resolveSignInProfile,
  profileCookieOptions,
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
    await getAccountProfile(email),
  );

  const next = profile.profileComplete ? "/dashboard" : "/welcome";
  const response = NextResponse.redirect(`${base}${next}`);
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(email, profile),
    sessionCookieOptions(),
  );
  if (profile.profileComplete) {
    response.cookies.set(
      PROFILE_COOKIE,
      createProfileToken({
        email,
        name: profile.name,
        org: profile.org,
      }),
      profileCookieOptions(),
    );
  }
  try {
    const place = requestPlace(request);
    await recordAccountEvent({
      kind: "sign_in",
      email,
      ip: place.ip,
      city: place.city,
      country: place.country,
    });
  } catch {
    // Sign-in cookies are already set.
  }
  return response;
}
