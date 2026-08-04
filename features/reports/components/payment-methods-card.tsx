import { Card } from "@/features/design-system";

import type { PaymentMethodRow } from "../types";

export function PaymentMethodsCard({ rows }: { rows: PaymentMethodRow[] }) {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[14px] font-semibold text-foreground">5. Payment methods analytics</h3>
        <span className="text-[10px] font-medium text-foreground-muted">Verification delay (avg.)</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_44px_56px] items-center gap-3 text-[11px]">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground">{row.label}</span>
                <span className="text-foreground-muted">{row.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${row.percentage}%` }} />
              </div>
            </div>
            <span className="text-right text-foreground-muted">{row.percentage}%</span>
            <span className="text-right text-foreground-muted">{row.delay}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
