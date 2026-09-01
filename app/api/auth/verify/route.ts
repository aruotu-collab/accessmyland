import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  appUrl,
  createSessionToken,
  readMagicToken,
  sessionCookieOptions,
} from "@/lib/auth";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const email = readMagicToken(token);
  const base = appUrl(request);

  if (!email) {
    return NextResponse.redirect(`${base}/login?error=invalid`);
  }

  const response = NextResponse.redirect(`${base}/dashboard`);
  response.cookies.set(
    SESSION_COOKIE,
    createSessionToken(email),
    sessionCookieOptions(),
  );
  return response;
}
