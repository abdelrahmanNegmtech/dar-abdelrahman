import { CheckCircle2 } from "lucide-react";

import { Card } from "@/features/design-system";

export function DataFreshnessCard() {
  return (
    <Card padding="md" className="space-y-4 rounded-[0.7rem] border-border/90 shadow-[0_2px_8px_rgba(16,25,58,0.03)]">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">Data freshness</h3>
        <p className="mt-2 text-[11px] leading-5 text-foreground-muted">
          All data is updated daily at 02:00 AM Cairo time (GMT+2).
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-[0.45rem] border border-success/15 bg-success-soft/35 px-3 py-2 text-[11px] font-medium text-success">
        <CheckCircle2 className="size-4" />
        All systems normal
      </div>
    </Card>
  );
}
