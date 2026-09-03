import { cookies } from "next/headers";
import { isAdminEmail } from "./admin";
import { SESSION_COOKIE, readSessionToken, type Session } from "./auth";

export async function requireAdmin(): Promise<Session | null> {
  const jar = await cookies();
  const session = readSessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session || !isAdminEmail(session.email)) return null;
  return session;
}
