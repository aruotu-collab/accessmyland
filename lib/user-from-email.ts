import type { User } from "./types";
import { USERS } from "./seed";

export function nameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "there";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function initialsFromName(name: string) {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AM"
  );
}

export function userFromEmail(
  email: string,
  profile?: { name?: string; org?: string },
): User {
  const normalised = email.toLowerCase().trim();
  const known = USERS.find((u) => u.email.toLowerCase() === normalised);
  const name = profile?.name?.trim() || known?.name || nameFromEmail(normalised);
  const org = profile?.org?.trim() || known?.org || "AccessMyLand";
  if (known && !profile?.name && !profile?.org) return known;
  return {
    id: known?.id ?? `u-${normalised}`,
    name,
    email: known?.email ?? normalised,
    role: known?.role ?? "operator",
    org,
    title: known?.title ?? "Signed in",
    initials: initialsFromName(name),
  };
}
