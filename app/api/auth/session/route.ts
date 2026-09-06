import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_NAME, isAdminEmail } from "@/lib/admin";
import { ensureAccount, getAccountProfile } from "@/lib/admin-store";
import { requestPlace } from "@/lib/visit";
import {
  PROFILE_COOKIE,
  SESSION_COOKIE,
  createSessionToken,
  nameFromEmail,
  readProfileToken,
  readSessionToken,
  sessionCookieOptions,
  userFromSession,
} from "@/lib/auth";

export async function GET(request: Request) {
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ user: null, profileComplete: false });
  }

  const saved = readProfileToken(jar.get(PROFILE_COOKIE)?.value);
  const stored =
    !session.profileComplete && !(saved && saved.email === session.email)
      ? await getAccountProfile(session.email)
      : null;

  let profileComplete = session.profileComplete;
  let name = session.name;
  let org = session.org;

  if (!profileComplete && saved && saved.email === session.email) {
    profileComplete = true;
    name = saved.name;
    org = saved.org;
  } else if (!profileComplete && stored) {
    profileComplete = true;
    name = stored.name;
    org = stored.org;
  } else if (!profileComplete && isAdminEmail(session.email)) {
    profileComplete = true;
    name = name && name !== nameFromEmail(session.email) ? name : ADMIN_NAME;
    org = org && org !== "AccessMyLand" ? org : "AccessMyLand";
  }

  const user = userFromSession({
    ...session,
    name,
    org,
    profileComplete,
  });

  const place = requestPlace(request);
  try {
    await ensureAccount({
      email: session.email,
      ip: place.ip,
      city: place.city,
      country: place.country,
      name,
      org,
    });
  } catch {
    // Listing members must not break sign-in.
  }

  const response = NextResponse.json({ user, profileComplete });
  if (profileComplete && !session.profileComplete) {
    response.cookies.set(
      SESSION_COOKIE,
      createSessionToken(session.email, { name, org, profileComplete: true }),
      sessionCookieOptions(),
    );
  }
  return response;
}
