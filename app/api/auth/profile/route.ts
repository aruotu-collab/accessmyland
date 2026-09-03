import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { recordAccountEvent, saveAccountProfile } from "@/lib/admin-store";
import {
  PROFILE_COOKIE,
  SESSION_COOKIE,
  createProfileToken,
  createSessionToken,
  isValidName,
  profileCookieOptions,
  readSessionToken,
  sessionCookieOptions,
  userFromSession,
} from "@/lib/auth";
import { requestPlace } from "@/lib/visit";

export async function POST(request: Request) {
  let name = "";
  let org = "";
  try {
    const body = (await request.json()) as { name?: string; org?: string };
    name = (body.name ?? "").trim();
    org = (body.org ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }

  if (!isValidName(name)) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (org.length > 80) {
    return NextResponse.json(
      { error: "Company name is too long." },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const current = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!current) {
    return NextResponse.json({ error: "Sign in again." }, { status: 401 });
  }

  const response = NextResponse.json({
    user: userFromSession({
      email: current.email,
      name,
      org,
      profileComplete: true,
      exp: current.exp,
    }),
    profileComplete: true,
  });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(current.email, { name, org, profileComplete: true }),
    sessionCookieOptions(),
  );
  response.cookies.set(
    PROFILE_COOKIE,
    createProfileToken({ email: current.email, name, org }),
    profileCookieOptions(),
  );

  try {
    await saveAccountProfile(current.email, name, org);
    const place = requestPlace(request);
    await recordAccountEvent({
      kind: "profile",
      email: current.email,
      ip: place.ip,
      city: place.city,
      country: place.country,
    });
  } catch {
    // Profile cookies are already set; logging must not block sign-in.
  }

  return response;
}
