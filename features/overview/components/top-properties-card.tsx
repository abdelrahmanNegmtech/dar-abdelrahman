import { Card } from "@/features/design-system";

import type { TopProperty } from "../types";
import { PropertyThumbnail } from "./property-thumbnail";

export function TopPropertiesCard({ items }: { items: TopProperty[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-foreground">Top properties</h2>
        <a href="#" className="text-[12px] font-semibold text-brand">
          View all
        </a>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3">
            <span className="inline-flex size-5 items-center justify-center rounded-[0.35rem] bg-brand-soft text-[11px] font-semibold text-brand">
              {item.rank}
            </span>
            <PropertyThumbnail variant={item.thumbnailKey} />
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-[12px] font-semibold text-foreground">
                {item.propertyName}
              </p>
              <p className="text-[11px] text-foreground-muted">{item.location}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-semibold text-foreground">{item.bookings}</p>
              <p className="text-[11px] text-foreground-muted">Bookings</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
