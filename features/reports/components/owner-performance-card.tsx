import { Avatar, Card } from "@/features/design-system";

import type { OwnerPerformanceRow } from "../types";

export function OwnerPerformanceCard({ rows }: { rows: OwnerPerformanceRow[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-foreground">7. Owner performance</h3>
        <a href="#" className="text-[11px] font-semibold text-brand">View all</a>
      </div>
      <div className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.7fr_0.7fr_0.7fr] gap-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-subtle">
        <span>Owner / Partner</span>
        <span>Revenue (EGP)</span>
        <span>Resp. time</span>
        <span>Approval rate</span>
        <span>Cancellation rate</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.owner} className="grid grid-cols-[minmax(0,1.2fr)_0.8fr_0.7fr_0.7fr_0.7fr] items-center gap-3 text-[11px]">
            <div className="flex items-center gap-2.5">
              <Avatar name={row.owner} size="sm" />
              <span className="font-medium text-foreground">{row.owner}</span>
            </div>
            <span>{row.revenue}</span>
            <span>{row.responseTime}</span>
            <span>{row.approvalRate}</span>
            <span>{row.cancellationRate}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
