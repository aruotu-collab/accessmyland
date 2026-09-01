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

export function userFromEmail(email: string): User {
  const normalised = email.toLowerCase().trim();
  const known = USERS.find((u) => u.email.toLowerCase() === normalised);
  if (known) return known;
  const name = nameFromEmail(normalised);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: `u-${normalised}`,
    name,
    email: normalised,
    role: "operator",
    org: "AccessMyLand",
    title: "Signed in",
    initials: initials || "AM",
  };
}
