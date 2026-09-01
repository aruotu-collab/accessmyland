import type { CaseStatus, Role } from "./types";

export const PIPELINE: CaseStatus[] = [
  "identifying",
  "owner_identified",
  "contacted",
  "offer_made",
  "negotiating",
  "terms_agreed",
  "licence_generated",
  "signed",
  "visit_scheduled",
  "access_evidenced",
  "damage_recorded",
  "payment_pending",
  "closed",
];

export const BOARD_COLUMNS: { id: string; title: string; statuses: CaseStatus[] }[] =
  [
    {
      id: "intake",
      title: "Intake",
      statuses: ["identifying", "owner_identified", "contacted"],
    },
    {
      id: "negotiate",
      title: "Negotiate",
      statuses: ["offer_made", "negotiating", "terms_agreed"],
    },
    {
      id: "formalise",
      title: "Formalise",
      statuses: ["licence_generated", "signed"],
    },
    {
      id: "onsite",
      title: "On site",
      statuses: ["visit_scheduled", "access_evidenced", "damage_recorded"],
    },
    {
      id: "close",
      title: "Close",
      statuses: ["payment_pending", "closed"],
    },
    {
      id: "market",
      title: "Marketplace",
      statuses: ["marketplace"],
    },
  ];

export function statusIndex(status: CaseStatus) {
  if (status === "marketplace") return 2;
  return Math.max(0, PIPELINE.indexOf(status));
}

export function nextAction(status: CaseStatus, role: Role): string {
  if (role === "landowner") {
    switch (status) {
      case "contacted":
      case "offer_made":
      case "negotiating":
        return "Review offer and respond";
      case "licence_generated":
        return "Sign the access licence";
      case "visit_scheduled":
        return "Note the visit window";
      case "payment_pending":
        return "Awaiting compensation";
      default:
        return "No action needed";
    }
  }
  if (role === "agent") {
    switch (status) {
      case "marketplace":
        return "Claim this case";
      case "owner_identified":
        return "Contact the landowner";
      case "contacted":
        return "Make an opening offer";
      case "offer_made":
      case "negotiating":
        return "Continue negotiation";
      case "terms_agreed":
        return "Generate the licence";
      case "licence_generated":
        return "Collect signatures";
      case "signed":
        return "Schedule the visit";
      case "visit_scheduled":
        return "Capture access evidence";
      case "access_evidenced":
        return "Record damage if any";
      case "damage_recorded":
      case "payment_pending":
        return "Confirm payment";
      default:
        return "Keep the file moving";
    }
  }
  switch (status) {
    case "identifying":
      return "Confirm owner / occupier";
    case "owner_identified":
      return "Make first contact";
    case "contacted":
      return "Issue opening offer";
    case "offer_made":
    case "negotiating":
      return "Settle compensation";
    case "terms_agreed":
      return "Generate access licence";
    case "licence_generated":
      return "Get both parties to sign";
    case "signed":
      return "Schedule the site visit";
    case "visit_scheduled":
      return "Evidence the access";
    case "access_evidenced":
      return "Record damage / reinstatement";
    case "damage_recorded":
      return "Pay the landowner";
    case "payment_pending":
      return "Mark paid and close";
    case "marketplace":
      return "Await an agent claim";
    default:
      return "Case complete";
  }
}
