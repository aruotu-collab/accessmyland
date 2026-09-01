import type { CaseStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/format";

const TONE: Record<CaseStatus, string> = {
  identifying: "bg-cream text-slate",
  owner_identified: "bg-cream text-forest",
  contacted: "bg-[#e8efe6] text-sage",
  offer_made: "bg-[#f4ead0] text-brass-deep",
  negotiating: "bg-[#f4ead0] text-brass-deep",
  terms_agreed: "bg-[#e3efe6] text-forest",
  licence_generated: "bg-[#e3efe6] text-forest",
  signed: "bg-[#dceee3] text-forest",
  visit_scheduled: "bg-[#e4eef2] text-slate",
  access_evidenced: "bg-[#e4eef2] text-slate",
  damage_recorded: "bg-[#f6e4dc] text-clay",
  payment_pending: "bg-[#f6e4dc] text-clay",
  closed: "bg-forest text-cream",
  marketplace: "bg-forest-deep text-brass",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${TONE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
