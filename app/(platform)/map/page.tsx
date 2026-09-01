"use client";

import { ParcelMap } from "@/components/ParcelMap";
import { useStore } from "@/lib/store";

export default function MapPage() {
  const { cases } = useStore();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-4xl text-forest">Working map</h1>
        <p className="mt-2 max-w-2xl text-slate">
          Parcels on live programmes across Lincolnshire. Click a pin to open the
          access file. Colour follows status: brass is negotiation, clay is
          marketplace or money, green is agreed or closed.
        </p>
      </div>
      <ParcelMap cases={cases} height="h-[640px]" />
    </div>
  );
}
