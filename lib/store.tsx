"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AGENTS, ACTIVITY, CASES, PROJECTS, USERS } from "./seed";
import type {
  AccessCase,
  ActivityItem,
  AppState,
  CaseStatus,
  OfferFrom,
  User,
} from "./types";

const KEY = "aml-store-v1";
const VERSION = 1;

function cloneCases(): AccessCase[] {
  return structuredClone(CASES);
}

function emptyState(): AppState {
  return {
    version: VERSION,
    currentUserId: null,
    cases: cloneCases(),
    activity: structuredClone(ACTIVITY),
  };
}

function loadState(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== VERSION) return emptyState();
    return parsed;
  } catch {
    return emptyState();
  }
}

interface StoreValue {
  ready: boolean;
  user: User | null;
  cases: AccessCase[];
  activity: ActivityItem[];
  login: (userId: string) => void;
  logout: () => void;
  reset: () => void;
  getCase: (id: string) => AccessCase | undefined;
  identifyOwner: (caseId: string, name: string, email?: string) => void;
  contactOwner: (caseId: string) => void;
  addOffer: (
    caseId: string,
    amount: number,
    conditions: string,
    from: OfferFrom,
  ) => void;
  acceptTerms: (caseId: string) => void;
  generateLicence: (caseId: string) => void;
  signLicence: (caseId: string) => void;
  scheduleVisit: (caseId: string, date: string, window: string, team: string) => void;
  addEvidence: (caseId: string, label: string) => void;
  recordDamage: (caseId: string, description: string, estimate: number) => void;
  markPaid: (caseId: string) => void;
  listMarketplace: (caseId: string, professionalFee: number) => void;
  claimCase: (caseId: string, agentId: string) => void;
  toggleCondition: (caseId: string, conditionId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(emptyState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const patchCase = useCallback(
    (caseId: string, fn: (c: AccessCase) => AccessCase, activityText: string) => {
      setState((prev) => {
        const user = USERS.find((u) => u.id === prev.currentUserId);
        const nextCases = prev.cases.map((c) => (c.id === caseId ? fn(c) : c));
        const item: ActivityItem = {
          id: `a-${Date.now()}`,
          caseId,
          at: new Date().toISOString(),
          text: activityText,
          by: user?.name ?? "System",
        };
        return {
          ...prev,
          cases: nextCases,
          activity: [item, ...prev.activity].slice(0, 80),
        };
      });
    },
    [],
  );

  const user = useMemo(
    () => USERS.find((u) => u.id === state.currentUserId) ?? null,
    [state.currentUserId],
  );

  const value: StoreValue = {
    ready,
    user,
    cases: state.cases,
    activity: state.activity,
    login: (userId) =>
      setState((s) => {
        const next = { ...s, currentUserId: userId };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      }),
    logout: () =>
      setState((s) => {
        const next = { ...s, currentUserId: null };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      }),
    reset: () =>
      setState({
        version: VERSION,
        currentUserId: state.currentUserId,
        cases: cloneCases(),
        activity: structuredClone(ACTIVITY),
      }),
    getCase: (id) => state.cases.find((c) => c.id === id),
    identifyOwner: (caseId, name, email) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "owner_identified",
          lastActivity: new Date().toISOString(),
          owner: { ...c.owner, name, email: email || c.owner.email },
        }),
        `Owner identified: ${name}.`,
      ),
    contactOwner: (caseId) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "contacted",
          lastActivity: new Date().toISOString(),
        }),
        "First contact made with the landowner.",
      ),
    addOffer: (caseId, amount, conditions, from) =>
      patchCase(
        caseId,
        (c) => {
          const nextStatus: CaseStatus =
            c.status === "contacted" || c.status === "owner_identified"
              ? "offer_made"
              : "negotiating";
          return {
            ...c,
            status: nextStatus,
            lastActivity: new Date().toISOString(),
            offers: [
              ...c.offers,
              {
                id: `o-${Date.now()}`,
                from,
                amount,
                conditions,
                at: new Date().toISOString(),
                author: user?.name ?? "User",
              },
            ],
          };
        },
        `${from === "landowner" ? "Counter-offer" : "Offer"} of £${amount.toLocaleString("en-GB")} submitted.`,
      ),
    acceptTerms: (caseId) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "terms_agreed",
          lastActivity: new Date().toISOString(),
          conditions: c.conditions.map((x) => ({ ...x, agreed: true })),
        }),
        "Terms agreed. Ready to generate the access licence.",
      ),
    generateLicence: (caseId) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "licence_generated",
          licenceGeneratedAt: new Date().toISOString(),
          signedByOperator: user?.role === "operator" || user?.role === "agent",
          lastActivity: new Date().toISOString(),
        }),
        "Access licence generated.",
      ),
    signLicence: (caseId) =>
      patchCase(
        caseId,
        (c) => {
          const asOwner = user?.role === "landowner";
          const signedByOwner = asOwner ? true : c.signedByOwner;
          const signedByOperator = asOwner ? c.signedByOperator : true;
          const both = Boolean(signedByOwner && signedByOperator);
          return {
            ...c,
            signedByOwner,
            signedByOperator,
            status: both ? "signed" : c.status,
            lastActivity: new Date().toISOString(),
          };
        },
        `${user?.name ?? "A party"} signed the access licence.`,
      ),
    scheduleVisit: (caseId, date, window, team) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "visit_scheduled",
          visit: { date, window, team, notes: "" },
          lastActivity: new Date().toISOString(),
        }),
        `Visit scheduled for ${date} (${window}).`,
      ),
    addEvidence: (caseId, label) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "access_evidenced",
          evidence: [
            ...c.evidence,
            {
              id: `e-${Date.now()}`,
              kind: "photo",
              label,
              at: new Date().toISOString(),
              by: user?.name ?? "Site team",
            },
          ],
          lastActivity: new Date().toISOString(),
        }),
        `Evidence added: ${label}.`,
      ),
    recordDamage: (caseId, description, estimate) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: estimate > 0 || description ? "damage_recorded" : "payment_pending",
          damage: description
            ? {
                description,
                estimate,
                reinstatement: "To be confirmed on close-out.",
                at: new Date().toISOString(),
              }
            : c.damage,
          lastActivity: new Date().toISOString(),
        }),
        description
          ? `Damage recorded — ${description} (£${estimate.toLocaleString("en-GB")}).`
          : "No damage recorded. Case moved to payment.",
      ),
    markPaid: (caseId) =>
      patchCase(
        caseId,
        (c) => {
          const base = c.offers.at(-1)?.amount ?? 0;
          const extra = c.damage?.estimate ?? 0;
          return {
            ...c,
            status: "closed",
            paidAmount: base + extra,
            paidAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          };
        },
        "Compensation paid. Case closed.",
      ),
    listMarketplace: (caseId, professionalFee) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: "marketplace",
          professionalFee,
          marketplaceFee: Math.round(professionalFee * 0.15),
          lastActivity: new Date().toISOString(),
        }),
        `Listed on the marketplace at £${professionalFee.toLocaleString("en-GB")} professional fee.`,
      ),
    claimCase: (caseId, agentId) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          status: c.owner.name.startsWith("Unknown") || c.owner.name.startsWith("Not yet")
            ? "identifying"
            : "owner_identified",
          assignedAgentId: agentId,
          lastActivity: new Date().toISOString(),
        }),
        "Independent land agent claimed this case.",
      ),
    toggleCondition: (caseId, conditionId) =>
      patchCase(
        caseId,
        (c) => ({
          ...c,
          conditions: c.conditions.map((x) =>
            x.id === conditionId ? { ...x, agreed: !x.agreed } : x,
          ),
        }),
        "Access condition updated.",
      ),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { AGENTS, PROJECTS, USERS };
