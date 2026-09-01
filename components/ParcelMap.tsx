"use client";

import Link from "next/link";
import type { AccessCase } from "@/lib/types";

const BOX = { minLat: 52.78, maxLat: 53.18, minLng: -0.82, maxLng: -0.22 };

function xy(lat: number, lng: number) {
  const x = ((lng - BOX.minLng) / (BOX.maxLng - BOX.minLng)) * 100;
  const y = ((BOX.maxLat - lat) / (BOX.maxLat - BOX.minLat)) * 100;
  return { x, y };
}

function points(polygon: [number, number][]) {
  return polygon
    .map(([lat, lng]) => {
      const p = xy(lat, lng);
      return `${p.x},${p.y}`;
    })
    .join(" ");
}

const TONE: Record<string, string> = {
  negotiating: "#c4a056",
  offer_made: "#c4a056",
  marketplace: "#b85c38",
  closed: "#3f6d52",
  payment_pending: "#b85c38",
  visit_scheduled: "#5c6b70",
  signed: "#12382b",
  terms_agreed: "#3f6d52",
};

export function ParcelMap({
  cases,
  highlightId,
  height = "h-[420px]",
}: {
  cases: AccessCase[];
  highlightId?: string;
  height?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line ${height} map-grid os-contour`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <text x="6" y="8" fontSize="2.4" fill="#12382b" opacity="0.45" fontFamily="ui-sans-serif">
          Lincolnshire · OS-style working map
        </text>
        {cases.map((c) => {
          const fill = TONE[c.status] ?? "#12382b";
          const active = c.id === highlightId;
          return (
            <g key={c.id}>
              <polygon
                points={points(c.parcel.polygon)}
                fill={fill}
                fillOpacity={active ? 0.45 : 0.22}
                stroke={fill}
                strokeWidth={active ? 0.7 : 0.35}
              />
            </g>
          );
        })}
      </svg>
      {cases.map((c) => {
        const p = xy(c.parcel.lat, c.parcel.lng);
        return (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            title={`${c.ref} · ${c.parcel.title}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-forest-deep/90 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-cream shadow-sm hover:bg-brass hover:text-forest-deep"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {c.ref.slice(-4)}
          </Link>
        );
      })}
    </div>
  );
}
