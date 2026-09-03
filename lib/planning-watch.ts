export const LINCOLNSHIRE_LPAS = [
  { entity: 626092, name: "Boston" },
  { entity: 626093, name: "East Lindsey" },
  { entity: 626094, name: "Lincoln" },
  { entity: 626095, name: "North Kesteven" },
  { entity: 626096, name: "South Holland" },
  { entity: 626097, name: "South Kesteven" },
  { entity: 626098, name: "West Lindsey" },
  { entity: 626054, name: "North East Lincolnshire" },
  { entity: 626055, name: "North Lincolnshire" },
] as const;

export const LINCOLNSHIRE_AUTHORITIES = [
  { entity: 53, name: "Boston Borough Council" },
  { entity: 124, name: "East Lindsey District Council" },
  { entity: 199, name: "City of Lincoln Council" },
  { entity: 201, name: "Lincolnshire County Council" },
  { entity: 227, name: "North East Lincolnshire Council" },
  { entity: 233, name: "North Kesteven District Council" },
  { entity: 234, name: "North Lincolnshire Council" },
  { entity: 296, name: "South Holland District Council" },
  { entity: 298, name: "South Kesteven District Council" },
  { entity: 372, name: "West Lindsey District Council" },
] as const;

const ACCESS_TERMS = [
  ["solar", "renewables"],
  ["energy park", "renewables"],
  ["wind", "renewables"],
  ["battery", "electricity"],
  ["cable", "electricity"],
  ["grid", "electricity"],
  ["pipeline", "electricity"],
  ["substation", "electricity"],
  ["overhead", "electricity"],
  ["underground", "electricity"],
  ["highway", "highways"],
  ["improvement", "highways"],
  ["terminal", "highways"],
  ["port", "highways"],
  ["reservoir", "water"],
  ["water", "water"],
  ["fibre", "telecom"],
  ["compound", "construction"],
  ["access", "construction"],
] as const;

const PLANNING_KEYWORDS = [
  "solar",
  "cable",
  "substation",
  "compound",
  "haul road",
  "temporary access",
  "underground",
  "overhead",
  "pipeline",
  "wind",
  "battery",
  "bess",
  "fibre",
  "culvert",
  "trial pit",
  "borehole",
  "wayleave",
  "easement",
];

const PLANNING_API = "https://www.planning.data.gov.uk";
const NSIP_URL = "https://national-infrastructure-consenting.planninginspectorate.gov.uk/projects";

export type DealSuggestion = {
  id: string;
  source: "nsip" | "planning";
  reference: string;
  name: string;
  summary: string;
  authorities: string[];
  lat: number | null;
  lng: number | null;
  url: string;
  firstSeenAt: string;
  lastSeenAt: string;
  status: "new" | "dismissed" | "opened";
  sector: string;
};

export type PlanningScanResult = {
  scanned: number;
  added: number;
  updated: number;
  suggestions: DealSuggestion[];
};

type PlanningEntity = {
  entity?: number;
  name?: string;
  reference?: string;
  description?: string;
  geometry?: string;
  point?: string;
  "entry-date"?: string;
  "organisation-entity"?: number | string;
};

function accessSector(text: string) {
  const lower = text.toLowerCase();
  for (const [term, sector] of ACCESS_TERMS) {
    if (lower.includes(term)) return sector;
  }
  return "electricity";
}

function parsePoint(wkt: string | undefined) {
  if (!wkt) return { lat: null, lng: null };
  const point = /POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i.exec(wkt);
  if (point) return { lng: Number(point[1]), lat: Number(point[2]) };
  const poly = /(?:MULTI)?POLYGON\s*\(\(+?\s*([-\d.]+)\s+([-\d.]+)/i.exec(wkt);
  if (poly) return { lng: Number(poly[1]), lat: Number(poly[2]) };
  return { lat: null, lng: null };
}

async function planningGet(path: string) {
  const res = await fetch(`${PLANNING_API}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "AccessMyLand/1.0 (Lincolnshire planning watch; https://www.accessmyland.com)",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Planning Data ${res.status} for ${path}`);
  }
  return (await res.json()) as { entities?: PlanningEntity[] };
}

function nsipUrl(reference: string) {
  return `${NSIP_URL}/${encodeURIComponent(reference)}`;
}

function entityUrl(entity: number) {
  return `${PLANNING_API}/entity/${entity}`;
}

export async function fetchLincolnshireDeals(): Promise<DealSuggestion[]> {
  const now = new Date().toISOString();
  const byRef = new Map<string, DealSuggestion>();

  for (const lpa of LINCOLNSHIRE_LPAS) {
    const data = await planningGet(
      `/entity.json?dataset=infrastructure-project&geometry_entity=${lpa.entity}&geometry_relation=intersects&limit=100`,
    );
    for (const item of data.entities ?? []) {
      const reference = (item.reference ?? "").trim();
      const name = (item.name ?? reference).trim();
      if (!reference || !name) continue;
      const id = `nsip:${reference}`;
      const existing = byRef.get(id);
      if (existing) {
        if (!existing.authorities.includes(lpa.name)) {
          existing.authorities = [...existing.authorities, lpa.name];
        }
        continue;
      }
      const point = parsePoint(item.point || item.geometry);
      byRef.set(id, {
        id,
        source: "nsip",
        reference,
        name,
        summary: `Nationally significant infrastructure intersecting ${lpa.name}. Third-party access is likely along the red-line boundary.`,
        authorities: [lpa.name],
        lat: point.lat,
        lng: point.lng,
        url: nsipUrl(reference),
        firstSeenAt: now,
        lastSeenAt: now,
        status: "new",
        sector: accessSector(name),
      });
    }
  }

  for (const authority of LINCOLNSHIRE_AUTHORITIES) {
    const data = await planningGet(
      `/entity.json?dataset=planning-application&organisation_entity=${authority.entity}&limit=100`,
    );
    for (const item of data.entities ?? []) {
      const description = (item.description ?? item.name ?? "").trim();
      const reference = (item.reference ?? "").trim();
      if (!reference || !description) continue;
      const haystack = description.toLowerCase();
      if (!PLANNING_KEYWORDS.some((word) => haystack.includes(word))) continue;
      const id = `planning:${authority.entity}:${reference}`;
      if (byRef.has(id)) continue;
      const point = parsePoint(item.point || item.geometry);
      byRef.set(id, {
        id,
        source: "planning",
        reference,
        name: description.slice(0, 140),
        summary: `Access-relevant planning application at ${authority.name}.`,
        authorities: [authority.name],
        lat: point.lat,
        lng: point.lng,
        url: item.entity ? entityUrl(item.entity) : `${PLANNING_API}/entity.json?reference=${encodeURIComponent(reference)}`,
        firstSeenAt: now,
        lastSeenAt: now,
        status: "new",
        sector: accessSector(description),
      });
    }
  }

  return [...byRef.values()].sort((a, b) => a.name.localeCompare(b.name));
}
