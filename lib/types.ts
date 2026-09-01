export type Role = "operator" | "agent" | "landowner";

export type Sector =
  | "rail"
  | "electricity"
  | "renewables"
  | "water"
  | "highways"
  | "telecom"
  | "environment";

export type AccessType =
  | "gi_borehole"
  | "trial_pit"
  | "walkover"
  | "compound"
  | "cable_pull"
  | "overhead_survey"
  | "construction"
  | "ecological";

export type LandUse =
  | "arable"
  | "pasture"
  | "woodland"
  | "roadside"
  | "garden"
  | "set_aside";

export type CaseStatus =
  | "identifying"
  | "owner_identified"
  | "contacted"
  | "offer_made"
  | "negotiating"
  | "terms_agreed"
  | "licence_generated"
  | "signed"
  | "visit_scheduled"
  | "access_evidenced"
  | "damage_recorded"
  | "payment_pending"
  | "closed"
  | "marketplace";

export type OfferFrom = "operator" | "agent" | "landowner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  org: string;
  title: string;
  initials: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  sector: Sector;
  client: string;
  county: string;
  startDate: string;
  endDate: string;
  description: string;
  caseIds: string[];
}

export interface Parcel {
  id: string;
  title: string;
  osGrid: string;
  areaHa: number;
  landUse: LandUse;
  county: string;
  lat: number;
  lng: number;
  polygon: [number, number][];
}

export interface Party {
  id: string;
  name: string;
  role: "owner" | "occupier" | "agent";
  org?: string;
  email?: string;
  phone?: string;
  userId?: string;
}

export interface Offer {
  id: string;
  from: OfferFrom;
  amount: number;
  conditions: string;
  at: string;
  author: string;
}

export interface Condition {
  id: string;
  text: string;
  agreed: boolean;
}

export interface Visit {
  date: string;
  window: string;
  team: string;
  notes: string;
}

export interface EvidenceItem {
  id: string;
  kind: "photo" | "note" | "gps";
  label: string;
  at: string;
  by: string;
}

export interface DamageRecord {
  description: string;
  estimate: number;
  reinstatement: string;
  at: string;
}

export interface AccessCase {
  id: string;
  ref: string;
  projectId: string;
  parcel: Parcel;
  status: CaseStatus;
  accessType: AccessType;
  durationDays: number;
  disturbance: string;
  cropImpact: string;
  owner: Party;
  occupier?: Party;
  assignedAgentId?: string;
  marketplaceFee?: number;
  professionalFee?: number;
  offers: Offer[];
  conditions: Condition[];
  visit?: Visit;
  evidence: EvidenceItem[];
  damage?: DamageRecord;
  paidAmount?: number;
  paidAt?: string;
  signedByOwner?: boolean;
  signedByOperator?: boolean;
  licenceGeneratedAt?: string;
  lastActivity: string;
  notes: string;
}

export interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  firm: string;
  counties: string[];
  specialisms: Sector[];
  rating: number;
  casesClosed: number;
  capacity: "available" | "limited" | "full";
  dayRate: number;
}

export interface ActivityItem {
  id: string;
  caseId: string;
  at: string;
  text: string;
  by: string;
}

export interface AppState {
  version: number;
  currentUserId: string | null;
  cases: AccessCase[];
  activity: ActivityItem[];
}
