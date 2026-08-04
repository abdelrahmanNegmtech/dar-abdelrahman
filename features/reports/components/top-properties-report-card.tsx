import { Star } from "lucide-react";

import { Card } from "@/features/design-system";
import { PropertyThumbnail } from "@/features/overview/components/property-thumbnail";

import type { TopPropertyReportRow } from "../types";

export function TopPropertiesReportCard({ rows }: { rows: TopPropertyReportRow[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-foreground">6. Top properties</h3>
        <a href="#" className="text-[11px] font-semibold text-brand">View all</a>
      </div>
      <div className="grid grid-cols-[minmax(0,1.3fr)_0.8fr_0.55fr_0.45fr_0.5fr_0.55fr] gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-subtle">
        <span>Property</span>
        <span>Revenue (EGP)</span>
        <span>Occupancy</span>
        <span>Rating</span>
        <span>Views</span>
        <span>Conversion</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.property} className="grid grid-cols-[minmax(0,1.3fr)_0.8fr_0.55fr_0.45fr_0.5fr_0.55fr] items-center gap-3 text-[11px]">
            <div className="flex items-center gap-2.5">
              <PropertyThumbnail variant={mapThumb(row.thumbnailKey)} />
              <span className="font-medium text-foreground">{row.property}</span>
            </div>
            <span className="text-foreground">{row.revenue}</span>
            <span className="text-foreground">{row.occupancy}</span>
            <span className="inline-flex items-center gap-1 text-foreground"><Star className="size-3.5 fill-warning text-warning" />{row.rating}</span>
            <span className="text-foreground">{row.views}</span>
            <span className="text-foreground">{row.conversion}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function mapThumb(key: TopPropertyReportRow["thumbnailKey"]) {
  return key === "modern"
    ? "zamalek"
    : key === "hotel"
      ? "sokhna"
      : key === "serviced"
        ? "new-cairo"
        : key === "balcony"
          ? "maadi"
          : "maadi";
}
