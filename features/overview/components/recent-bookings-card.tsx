import { Badge, Card } from "@/features/design-system";

import type { RecentBooking } from "../types";
import { PropertyThumbnail } from "./property-thumbnail";

const STATUS_TONE = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
} as const;

export function RecentBookingsCard({ items }: { items: RecentBooking[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.85rem] border-border/85 shadow-[0_4px_14px_rgba(16,25,58,0.035)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-foreground">Recent bookings</h2>
        <a href="#" className="text-[12px] font-semibold text-brand">
          View all
        </a>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-3">
            <PropertyThumbnail variant={item.thumbnailKey} />
            <div className="min-w-0 space-y-0.5">
              <p className="truncate text-[12px] font-semibold text-foreground">
                {item.propertyName}
              </p>
              <p className="text-[11px] text-foreground-muted">{item.location}</p>
            </div>
            <div className="space-y-0.5 text-right">
              <p className="text-[11px] text-foreground-muted">{item.dateRange}</p>
              <p className="text-[11px] text-foreground-muted">{item.nights}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[12px] font-semibold text-foreground">{item.amount}</p>
              <Badge tone={STATUS_TONE[item.status]} className="px-2 py-0.5 text-[10px] capitalize shadow-none">
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
