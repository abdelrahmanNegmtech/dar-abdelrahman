import { MapPin } from "lucide-react";

import { Card } from "@/features/design-system";

import type { CityPerformanceRow } from "../types";

export function CityPerformanceCard({ rows }: { rows: CityPerformanceRow[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-foreground">3. City performance</h3>
        <a href="#" className="text-[11px] font-semibold text-brand">View full report</a>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_0.9fr_0.6fr_0.9fr] gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-subtle">
        <span>City</span>
        <span>GBV (EGP)</span>
        <span>Bookings</span>
        <span>Occupancy</span>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.city} className="grid grid-cols-[minmax(0,1.1fr)_0.9fr_0.6fr_0.9fr] items-center gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-brand" />
              <span className="font-medium text-foreground">{row.city}</span>
            </div>
            <span className="text-foreground">{row.gbv}</span>
            <span className="text-foreground">{row.bookings}</span>
            <div className="flex items-center gap-2">
              <span className="w-8 text-foreground">{row.occupancy}%</span>
              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-success" style={{ width: `${row.occupancy}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
