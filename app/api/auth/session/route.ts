import { cookies } from "next/headers";
import { SESSION_COOKIE, readSessionToken, userFromSession } from "@/lib/auth";

export async function GET() {
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) {
    return Response.json({ user: null, profileComplete: false });
  }
  return Response.json({
    user: userFromSession(session),
    profileComplete: session.profileComplete,
  });
}
