import type { AccessType, LandUse } from "./types";

export interface Benchmark {
  accessType: AccessType;
  landUse: LandUse;
  county: string;
  samples: number;
  p25: number;
  median: number;
  p75: number;
  openToSettle: number;
}

export const BENCHMARKS: Benchmark[] = [
  { accessType: "gi_borehole", landUse: "arable", county: "Lincolnshire", samples: 86, p25: 620, median: 780, p75: 950, openToSettle: 1.18 },
  { accessType: "gi_borehole", landUse: "pasture", county: "Lincolnshire", samples: 41, p25: 540, median: 690, p75: 820, openToSettle: 1.14 },
  { accessType: "gi_borehole", landUse: "arable", county: "Nottinghamshire", samples: 33, p25: 600, median: 750, p75: 910, openToSettle: 1.16 },
  { accessType: "trial_pit", landUse: "arable", county: "Lincolnshire", samples: 54, p25: 480, median: 610, p75: 760, openToSettle: 1.21 },
  { accessType: "walkover", landUse: "arable", county: "Lincolnshire", samples: 120, p25: 150, median: 220, p75: 280, openToSettle: 1.08 },
  { accessType: "compound", landUse: "arable", county: "Lincolnshire", samples: 19, p25: 4200, median: 5600, p75: 7400, openToSettle: 1.32 },
  { accessType: "compound", landUse: "pasture", county: "Lincolnshire", samples: 11, p25: 3800, median: 5100, p75: 6800, openToSettle: 1.28 },
  { accessType: "cable_pull", landUse: "arable", county: "Lincolnshire", samples: 27, p25: 1100, median: 1450, p75: 1900, openToSettle: 1.22 },
  { accessType: "overhead_survey", landUse: "arable", county: "Lincolnshire", samples: 38, p25: 280, median: 360, p75: 450, openToSettle: 1.11 },
  { accessType: "construction", landUse: "arable", county: "Lincolnshire", samples: 16, p25: 2800, median: 3900, p75: 5200, openToSettle: 1.35 },
  { accessType: "ecological", landUse: "woodland", county: "Lincolnshire", samples: 22, p25: 180, median: 260, p75: 340, openToSettle: 1.09 },
  { accessType: "gi_borehole", landUse: "arable", county: "Cambridgeshire", samples: 29, p25: 640, median: 810, p75: 990, openToSettle: 1.19 },
  { accessType: "walkover", landUse: "pasture", county: "Yorkshire", samples: 44, p25: 140, median: 200, p75: 260, openToSettle: 1.07 },
  { accessType: "cable_pull", landUse: "roadside", county: "Lincolnshire", samples: 18, p25: 350, median: 480, p75: 640, openToSettle: 1.12 },
];

export function findBenchmark(
  accessType: AccessType,
  landUse: LandUse,
  county: string,
) {
  return (
    BENCHMARKS.find(
      (b) =>
        b.accessType === accessType &&
        b.landUse === landUse &&
        b.county === county,
    ) ||
    BENCHMARKS.find(
      (b) => b.accessType === accessType && b.landUse === landUse,
    ) ||
    BENCHMARKS.find((b) => b.accessType === accessType) ||
    null
  );
}

export function suggestedOpening(accessType: AccessType, landUse: LandUse, county: string) {
  const b = findBenchmark(accessType, landUse, county);
  if (!b) return 500;
  return Math.round(b.median / b.openToSettle / 10) * 10;
}
