import { cookies } from "next/headers";
import { recordAccountEvent } from "@/lib/admin-store";
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
    return Response.json({ error: "Enter your name." }, { status: 400 });
  }

  if (!isValidName(name)) {
    return Response.json({ error: "Enter your name." }, { status: 400 });
  }
  if (org.length > 80) {
    return Response.json(
      { error: "Company name is too long." },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return Response.json({ error: "Sign in again." }, { status: 401 });
  }

  const nextSession = {
    name,
    org,
    profileComplete: true,
  };
  jar.set(
    SESSION_COOKIE,
    createSessionToken(session.email, nextSession),
    sessionCookieOptions(),
  );
  jar.set(
    PROFILE_COOKIE,
    createProfileToken({ email: session.email, name, org }),
    profileCookieOptions(),
  );

  const place = requestPlace(request);
  await recordAccountEvent({
    kind: "profile",
    email: session.email,
    ip: place.ip,
    city: place.city,
    country: place.country,
  });

  return Response.json({
    user: userFromSession({
      email: session.email,
      name,
      org,
      profileComplete: true,
      exp: session.exp,
    }),
    profileComplete: true,
  });
}
