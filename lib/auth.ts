import { createHmac, timingSafeEqual } from "crypto";
import { nameFromEmail, userFromEmail } from "./user-from-email";
import type { User } from "./types";

export const SESSION_COOKIE = "aml_session";
const MAGIC_TTL_MS = 15 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type Session = {
  email: string;
  name: string;
  exp: number;
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

export function createSessionToken(email: string) {
  const normalised = email.toLowerCase().trim();
  return encode({
    email: normalised,
    name: nameFromEmail(normalised),
    exp: Date.now() + SESSION_TTL_MS,
    kind: "session",
  });
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const data = decode<Session & { kind: string }>(token);
  if (!data || data.kind !== "session" || data.exp < Date.now()) return null;
  return { email: data.email, name: data.name, exp: data.exp };
}

export { nameFromEmail };

export function userFromSession(session: Session): User {
  return userFromEmail(session.email);
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
