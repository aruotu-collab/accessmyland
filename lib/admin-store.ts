import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type WebVisit = {
  id: string;
  at: string;
  path: string;
  referrer: string;
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  latitude: string;
  longitude: string;
  userAgent: string;
  device: string;
  browser: string;
  email: string;
};

export type AccountRecord = {
  email: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastSignInAt: string;
  magicLinkCount: number;
  signInCount: number;
  lastIp: string;
  lastCity: string;
  lastCountry: string;
  name?: string;
  org?: string;
  profileComplete?: boolean;
};

export type AdminEvent = {
  id: string;
  at: string;
  kind: "magic_link" | "sign_in" | "profile";
  email: string;
  ip: string;
  city: string;
  country: string;
};

type AdminStore = {
  visits: WebVisit[];
  accounts: AccountRecord[];
  events: AdminEvent[];
};

const MAX_VISITS = 2000;
const MAX_EVENTS = 500;
const MAX_ACCOUNTS = 500;
const DEDUPE_MS = 45_000;

const globalForStore = globalThis as typeof globalThis & {
  __amlAdminStore?: AdminStore;
  __amlAdminWrite?: Promise<void>;
};

function emptyStore(): AdminStore {
  return { visits: [], accounts: [], events: [] };
}

function storePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "accessmyland-admin.json");
  }
  return path.join(process.cwd(), "data", "accessmyland-admin.json");
}

async function readStore(): Promise<AdminStore> {
  if (globalForStore.__amlAdminStore) return globalForStore.__amlAdminStore;
  try {
    const raw = await readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as AdminStore;
    const store: AdminStore = {
      visits: Array.isArray(parsed.visits) ? parsed.visits : [],
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
    globalForStore.__amlAdminStore = store;
    return store;
  } catch {
    const store = emptyStore();
    globalForStore.__amlAdminStore = store;
    return store;
  }
}

async function persist(store: AdminStore) {
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(store), "utf8");
}

async function mutate<T>(fn: (store: AdminStore) => T): Promise<T> {
  const previous = globalForStore.__amlAdminWrite ?? Promise.resolve();
  let result!: T;
  const next = previous.then(async () => {
    const store = await readStore();
    result = fn(store);
    globalForStore.__amlAdminStore = store;
    await persist(store);
  });
  globalForStore.__amlAdminWrite = next.then(
    () => undefined,
    () => undefined,
  );
  await next;
  return result;
}

function nowId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function recordVisit(
  input: Omit<WebVisit, "id" | "at"> & { at?: string },
) {
  const at = input.at ?? new Date().toISOString();
  return mutate((store) => {
    const recent = store.visits.find(
      (visit) =>
        visit.ip === input.ip &&
        visit.path === input.path &&
        Date.parse(at) - Date.parse(visit.at) < DEDUPE_MS,
    );
    if (recent) return recent;
    const visit: WebVisit = {
      id: nowId("v"),
      at,
      path: input.path,
      referrer: input.referrer,
      ip: input.ip,
      country: input.country,
      countryCode: input.countryCode,
      region: input.region,
      city: input.city,
      latitude: input.latitude,
      longitude: input.longitude,
      userAgent: input.userAgent,
      device: input.device,
      browser: input.browser,
      email: input.email,
    };
    store.visits = [visit, ...store.visits].slice(0, MAX_VISITS);
    return visit;
  });
}

export async function recordAccountEvent(input: {
  kind: AdminEvent["kind"];
  email: string;
  ip?: string;
  city?: string;
  country?: string;
}) {
  const email = input.email.toLowerCase().trim();
  if (!email) return;
  const at = new Date().toISOString();
  await mutate((store) => {
    const event: AdminEvent = {
      id: nowId("e"),
      at,
      kind: input.kind,
      email,
      ip: input.ip ?? "",
      city: input.city ?? "",
      country: input.country ?? "",
    };
    store.events = [event, ...store.events].slice(0, MAX_EVENTS);

    const existing = store.accounts.find((account) => account.email === email);
    if (existing) {
      existing.lastSeenAt = at;
      if (input.kind === "sign_in") {
        existing.lastSignInAt = at;
        existing.signInCount += 1;
      }
      if (input.kind === "magic_link") existing.magicLinkCount += 1;
      if (input.ip) existing.lastIp = input.ip;
      if (input.city) existing.lastCity = input.city;
      if (input.country) existing.lastCountry = input.country;
    } else {
      store.accounts = [
        {
          email,
          firstSeenAt: at,
          lastSeenAt: at,
          lastSignInAt: input.kind === "sign_in" ? at : "",
          magicLinkCount: input.kind === "magic_link" ? 1 : 0,
          signInCount: input.kind === "sign_in" ? 1 : 0,
          lastIp: input.ip ?? "",
          lastCity: input.city ?? "",
          lastCountry: input.country ?? "",
        },
        ...store.accounts,
      ].slice(0, MAX_ACCOUNTS);
    }
  });
}

export async function saveAccountProfile(
  email: string,
  name: string,
  org: string,
) {
  const normalised = email.toLowerCase().trim();
  if (!normalised || !name.trim()) return;
  const at = new Date().toISOString();
  await mutate((store) => {
    const existing = store.accounts.find((account) => account.email === normalised);
    if (existing) {
      existing.name = name.trim();
      existing.org = org.trim();
      existing.profileComplete = true;
      existing.lastSeenAt = at;
      return;
    }
    store.accounts = [
      {
        email: normalised,
        firstSeenAt: at,
        lastSeenAt: at,
        lastSignInAt: "",
        magicLinkCount: 0,
        signInCount: 0,
        lastIp: "",
        lastCity: "",
        lastCountry: "",
        name: name.trim(),
        org: org.trim(),
        profileComplete: true,
      },
      ...store.accounts,
    ].slice(0, MAX_ACCOUNTS);
  });
}

export async function getAccountProfile(email: string) {
  const store = await readStore();
  const account = store.accounts.find(
    (item) => item.email === email.toLowerCase().trim(),
  );
  if (!account?.profileComplete || !account.name) return null;
  return { email: account.email, name: account.name, org: account.org ?? "" };
}

export async function listVisits() {
  const store = await readStore();
  return store.visits;
}

export async function listAccounts() {
  const store = await readStore();
  return store.accounts;
}

export async function listEvents() {
  const store = await readStore();
  return store.events;
}

export async function clearVisits() {
  await mutate((store) => {
    store.visits = [];
  });
}

export async function visitStats() {
  const store = await readStore();
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recent = store.visits.filter((visit) => Date.parse(visit.at) >= dayAgo);
  const uniqueIps = new Set(recent.map((visit) => visit.ip).filter(Boolean));
  const countries = new Map<string, number>();
  const pages = new Map<string, number>();
  for (const visit of recent) {
    const country = visit.country || "Unknown";
    countries.set(country, (countries.get(country) ?? 0) + 1);
    pages.set(visit.path, (pages.get(visit.path) ?? 0) + 1);
  }
  const rank = (map: Map<string, number>) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));
  const events24h = store.events.filter((event) => Date.parse(event.at) >= dayAgo);
  return {
    visits24h: recent.length,
    uniqueIps24h: uniqueIps.size,
    signIns24h: events24h.filter((event) => event.kind === "sign_in").length,
    magicLinks24h: events24h.filter((event) => event.kind === "magic_link").length,
    accounts: store.accounts.length,
    totalVisits: store.visits.length,
    topCountries: rank(countries),
    topPages: rank(pages),
  };
}
