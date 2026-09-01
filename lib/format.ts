import type {
  AccessType,
  CaseStatus,
  LandUse,
  Role,
  Sector,
} from "./types";

export function gbp(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function gbpExact(n: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(n);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export const STATUS_LABEL: Record<CaseStatus, string> = {
  identifying: "Identifying land",
  owner_identified: "Owner identified",
  contacted: "Contacted",
  offer_made: "Offer made",
  negotiating: "Negotiating",
  terms_agreed: "Terms agreed",
  licence_generated: "Licence generated",
  signed: "Signed",
  visit_scheduled: "Visit scheduled",
  access_evidenced: "Access evidenced",
  damage_recorded: "Damage recorded",
  payment_pending: "Payment pending",
  closed: "Closed",
  marketplace: "On marketplace",
};

export const SECTOR_LABEL: Record<Sector, string> = {
  rail: "Rail",
  electricity: "Electricity",
  renewables: "Renewables",
  water: "Water",
  highways: "Highways",
  telecom: "Telecom",
  environment: "Environment",
};

export const ACCESS_LABEL: Record<AccessType, string> = {
  gi_borehole: "GI borehole",
  trial_pit: "Trial pit",
  walkover: "Walkover survey",
  compound: "Compound / welfare",
  cable_pull: "Cable pull",
  overhead_survey: "Overhead survey",
  construction: "Construction access",
  ecological: "Ecological survey",
};

export const LAND_LABEL: Record<LandUse, string> = {
  arable: "Arable",
  pasture: "Pasture",
  woodland: "Woodland",
  roadside: "Roadside verge",
  garden: "Garden / amenity",
  set_aside: "Set-aside",
};

export const ROLE_LABEL: Record<Role, string> = {
  operator: "Infrastructure operator",
  agent: "Land agent",
  landowner: "Landowner",
};

export function latestOffer(offers: { amount: number }[]) {
  return offers.at(-1)?.amount ?? 0;
}

export function openingOffer(offers: { amount: number; from: string }[]) {
  return offers.find((o) => o.from !== "landowner")?.amount ?? 0;
}

export function settledAmount(offers: { amount: number }[], status: CaseStatus) {
  const settled: CaseStatus[] = [
    "terms_agreed",
    "licence_generated",
    "signed",
    "visit_scheduled",
    "access_evidenced",
    "damage_recorded",
    "payment_pending",
    "closed",
  ];
  if (!settled.includes(status)) return null;
  return offers.at(-1)?.amount ?? null;
}
