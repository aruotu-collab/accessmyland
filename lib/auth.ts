import { createHmac, timingSafeEqual } from "crypto";
import { nameFromEmail, userFromEmail } from "./user-from-email";
import type { User } from "./types";

export const SESSION_COOKIE = "aml_session";
export const PROFILE_COOKIE = "aml_profile";
const MAGIC_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PROFILE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export type Session = {
  email: string;
  name: string;
  org: string;
  profileComplete: boolean;
  exp: number;
};

export type SavedProfile = {
  email: string;
  name: string;
  org: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function encode(data: Record<string, unknown>) {
  const payload = Buffer.from(JSON.stringify(data), "utf8").toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode<T>(token: string): T | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function createMagicToken(email: string) {
  return encode({
    email: email.toLowerCase().trim(),
    exp: Date.now() + MAGIC_TTL_MS,
    kind: "magic",
  });
}

export function readMagicToken(token: string) {
  const data = decode<{ email: string; exp: number; kind: string }>(token);
  if (!data || data.kind !== "magic" || data.exp < Date.now()) return null;
  return data.email;
}

export function createSessionToken(
  email: string,
  profile?: { name?: string; org?: string; profileComplete?: boolean },
) {
  const normalised = email.toLowerCase().trim();
  const name = profile?.name?.trim() || nameFromEmail(normalised);
  const org = profile?.org?.trim() || "AccessMyLand";
  return encode({
    email: normalised,
    name,
    org,
    profileComplete: Boolean(profile?.profileComplete),
    exp: Date.now() + SESSION_TTL_MS,
    kind: "session",
  });
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const data = decode<Session & { kind: string }>(token);
  if (!data || data.kind !== "session" || data.exp < Date.now()) return null;
  return {
    email: data.email,
    name: data.name || nameFromEmail(data.email),
    org: data.org || "AccessMyLand",
    profileComplete: Boolean(data.profileComplete),
    exp: data.exp,
  };
}

export function createProfileToken(profile: SavedProfile) {
  return encode({
    email: profile.email.toLowerCase().trim(),
    name: profile.name.trim(),
    org: profile.org.trim(),
    exp: Date.now() + PROFILE_TTL_MS,
    kind: "profile",
  });
}

export function readProfileToken(token: string | undefined): SavedProfile | null {
  if (!token) return null;
  const data = decode<SavedProfile & { kind: string; exp: number }>(token);
  if (!data || data.kind !== "profile" || data.exp < Date.now() || !data.name) {
    return null;
  }
  return { email: data.email, name: data.name, org: data.org ?? "" };
}

export function resolveSignInProfile(
  email: string,
  session: Session | null,
  saved: SavedProfile | null,
) {
  const known = userFromEmail(email);
  if (saved && saved.email === email) {
    return { name: saved.name, org: saved.org, profileComplete: true };
  }
  if (session && session.email === email && session.profileComplete) {
    return {
      name: session.name,
      org: session.org,
      profileComplete: true,
    };
  }
  if (known.id !== `u-${email}`) {
    return { name: known.name, org: known.org, profileComplete: true };
  }
  return {
    name: nameFromEmail(email),
    org: "",
    profileComplete: false,
  };
}

export { nameFromEmail };

export function userFromSession(session: Session): User {
  return userFromEmail(session.email, {
    name: session.name,
    org: session.profileComplete ? session.org : session.org || undefined,
  });
}

export function isValidName(value: string) {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function appUrl(request: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const origin = new URL(request.url).origin;
  if (origin.includes("localhost") || origin.includes("127.0.0.1")) return origin;
  return "https://www.accessmyland.com";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export function profileCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PROFILE_TTL_MS / 1000,
  };
}
